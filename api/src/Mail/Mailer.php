<?php
declare(strict_types=1);

namespace Milis\Mail;

use Milis\Config;
use PHPMailer\PHPMailer\PHPMailer;

/**
 * Envía emails de texto. Con mail.transport = 'smtp' usa el correo de Hostinger;
 * con 'log' guarda cada email como archivo en mail.log_dir (para desarrollo y pruebas).
 */
final class Mailer
{
    public function __construct(private readonly Config $config)
    {
    }

    public function send(string $to, string $subject, string $body): void
    {
        match ($this->config->get('mail.transport')) {
            'smtp' => $this->sendSmtp($to, $subject, $body),
            'log' => $this->writeToLog($to, $subject, $body),
            default => throw new \RuntimeException('mail.transport tiene que ser "smtp" o "log".'),
        };
    }

    private function sendSmtp(string $to, string $subject, string $body): void
    {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = (string) $this->config->get('mail.smtp.host');
        $mail->Port = (int) $this->config->get('mail.smtp.port', 465);
        $mail->SMTPAuth = true;
        $mail->Username = (string) $this->config->get('mail.smtp.user');
        $mail->Password = (string) $this->config->get('mail.smtp.pass');
        $mail->SMTPSecure = $this->config->get('mail.smtp.encryption') === 'tls'
            ? PHPMailer::ENCRYPTION_STARTTLS
            : PHPMailer::ENCRYPTION_SMTPS;
        $mail->CharSet = PHPMailer::CHARSET_UTF8;
        $mail->setFrom((string) $this->config->get('mail.from_email'), (string) $this->config->get('mail.from_name', 'Milicianos'));
        $mail->addAddress($to);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->send();
    }

    private function writeToLog(string $to, string $subject, string $body): void
    {
        $dir = (string) $this->config->get('mail.log_dir');
        if ($dir === '' || (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir))) {
            throw new \RuntimeException('mail.log_dir no existe ni se pudo crear.');
        }
        $file = sprintf('%s/%s-%s.txt', rtrim($dir, '/'), gmdate('Ymd-His'), bin2hex(random_bytes(4)));
        file_put_contents($file, "Para: $to\nAsunto: $subject\n\n$body\n");
    }
}
