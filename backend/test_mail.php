<?php
require_once __DIR__ . '/lib/Mailer.php';

try {
    $mailer = new Mailer();
    $result = $mailer->sendPasswordReset('phubet.ph@ku.th', 'http://localhost:3000/reset-password?token=test123');
    echo "ส่งอีเมลสำเร็จ";
} catch (Exception $e) {
    echo "เกิดข้อผิดพลาด: " . $e->getMessage();
}