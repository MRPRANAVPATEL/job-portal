const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const db = require('../config/db.config').promise();
const {sendMail, mailConfigured} = require('../utils/mailer');
const digest = value => crypto.createHmac('sha256', process.env.SESSION_SECRET).update(value).digest('hex');
const receipt = {message: 'If this email is registered, a code will arrive shortly. Allow a minute before requesting another.'};
const invalid = {message: 'Invalid or expired code. Request a new code if needed.'};

exports.sendOtp = async (req, res) => {
  if (!mailConfigured()) return res.status(503).json({message: 'Password reset email has not been configured.'});
  const email = String(req.body.email || '').trim();
  const [[user]] = await db.execute('SELECT user_id FROM users WHERE email=?', [email]);
  if (!user) return res.json(receipt);
  const code = String(crypto.randomInt(100000, 1000000));
  const hash = digest(user.user_id + ':' + code);
  // The unique user row makes the one-minute resend limit atomic.
  await db.execute('INSERT IGNORE INTO password_resets(user_id,code_hash,expires_at,sent_at) VALUES(?,?,NOW(),DATE_SUB(NOW(),INTERVAL 2 MINUTE))', [user.user_id, '']);
  const [change] = await db.execute('UPDATE password_resets SET code_hash=?,token_hash=NULL,attempts=0,expires_at=DATE_ADD(NOW(),INTERVAL 10 MINUTE),sent_at=NOW() WHERE user_id=? AND sent_at<=DATE_SUB(NOW(),INTERVAL 1 MINUTE)', [hash,user.user_id]);
  if (change.affectedRows) {
    try { await sendMail(email, 'JobSphere password reset', 'Your reset code is ' + code + '. It expires in 10 minutes.'); }
    catch {
      await db.execute('DELETE FROM password_resets WHERE user_id=? AND code_hash=?',[user.user_id,hash]);
      return res.status(503).json({message: 'Email delivery failed. Please try again later.'});
    }
  }
  res.json(receipt);
};

exports.verifyOtp = async (req,res) => {
  const {email,otp} = req.body;
  const [[user]] = await db.execute('SELECT user_id FROM users WHERE email=?',[String(email || '').trim()]);
  if (!user || !/^\d{6}$/.test(otp)) return res.status(400).json(invalid);
  const hash = digest(user.user_id + ':' + otp);
  const token = crypto.randomBytes(32).toString('hex');
  const active = ' WHERE user_id=? AND expires_at>NOW() AND attempts<5 AND token_hash IS NULL';
  const [record] = await db.execute('UPDATE password_resets SET token_hash=?, code_hash=?' + active + ' AND code_hash=?',[digest(token),'',user.user_id,hash]);
  if (!record.affectedRows) {
    await db.execute('UPDATE password_resets SET attempts=attempts+1' + active,[user.user_id]);
    return res.status(400).json(invalid);
  }
  res.json({message:'Code verified.', resetToken:token});
};

exports.resetPassword = async (req,res) => {
  const {email,newPassword,resetToken} = req.body;
  if (typeof newPassword !== 'string' || newPassword.length < 8 || Buffer.byteLength(newPassword)>72)
    return res.status(400).json({message:'Use at least 8 characters and at most 72 bytes.'});
  if (typeof resetToken !== 'string' || !/^[a-f0-9]{64}$/.test(resetToken)) return res.status(400).json(invalid);
  const password = await bcrypt.hash(newPassword,10);
  const [changed] = await db.execute('UPDATE users u JOIN password_resets r ON u.user_id=r.user_id SET u.password=?, r.token_hash=NULL,r.expires_at=NOW() WHERE u.email=? AND r.token_hash=? AND r.expires_at>NOW()', [password,String(email || '').trim(),digest(resetToken)]);
  if (!changed.affectedRows) return res.status(400).json(invalid);
  res.json({message:'Password updated. Sign in with your new password.'});
};
