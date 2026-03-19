<?php
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Mailer {
    private $mailer;
    private $config;

    public function __construct() {
        $this->config = require __DIR__ . '/../config/mail.php';
        $this->mailer = new PHPMailer(true);

        // Server settings
        $this->mailer->isSMTP();
        $this->mailer->Host = $this->config['host'];
        $this->mailer->SMTPAuth = true;
        $this->mailer->Username = $this->config['username'];
        $this->mailer->Password = $this->config['password'];
        $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mailer->Port = $this->config['port'];
        $this->mailer->CharSet = 'UTF-8';

        // Default sender
        $this->mailer->setFrom($this->config['from_email'], $this->config['from_name']);
    }

    public function sendPasswordReset($email, $resetUrl) {
        try {
            $this->mailer->addAddress($email);
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'รีเซ็ตรหัสผ่าน - ระบบที่ปรึกษานิสิต';
            
            // Email body in Thai
            $this->mailer->Body = "
                <div style='font-family: sans-serif;'>
                    <h2>รีเซ็ตรหัสผ่าน</h2>
                    <p>คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณในระบบที่ปรึกษานิสิต</p>
                    <p>กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
                    <p><a href='$resetUrl'>คลิกที่นี่เพื่อรีเซ็ตรหัสผ่าน</a></p>
                    <p>ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง</p>
                    <p>หากคุณไม่ได้เป็นผู้ขอรีเซ็ตรหัสผ่าน กรุณาละเลยอีเมลฉบับนี้</p>
                    <br>
                    <p>ขอแสดงความนับถือ</p>
                    <p>ทีมงานระบบที่ปรึกษานิสิต</p>
                </div>
            ";

            $this->mailer->AltBody = "
                รีเซ็ตรหัสผ่าน
                
                คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณในระบบที่ปรึกษานิสิต
                
                กรุณาใช้ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:
                $resetUrl
                
                ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง
                
                หากคุณไม่ได้เป็นผู้ขอรีเซ็ตรหัสผ่าน กรุณาละเลยอีเมลฉบับนี้
                
                ขอแสดงความนับถือ
                ทีมงานระบบที่ปรึกษานิสิต
            ";

            return $this->mailer->send();
        } catch (Exception $e) {
            throw new Exception('ไม่สามารถส่งอีเมลได้: ' . $e->getMessage());
        } finally {
            $this->mailer->clearAddresses();
        }
    }
}