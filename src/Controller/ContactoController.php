<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Attribute\Route;

class ContactoController extends AbstractController
{
    /**
     * POST /api/contacto
     * Recibe el formulario de contacto y reenvía el mensaje por correo a Luz Aldape.
     */
    #[Route('/api/contacto', name: 'api_contacto', methods: ['POST'])]
    public function enviar(Request $request, MailerInterface $mailer): JsonResponse
    {
        $datos = json_decode($request->getContent(), true);

        $nombre  = trim($datos['nombre']  ?? '');
        $email   = trim($datos['email']   ?? '');
        $tipo    = trim($datos['tipo']    ?? 'Otro');
        $mensaje = trim($datos['mensaje'] ?? '');

        if (!$nombre || !$email || !$mensaje) {
            return $this->json(['error' => 'Nombre, correo y mensaje son obligatorios'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['error' => 'El correo electrónico no es válido'], 400);
        }

        // Destinatario: correo de Luz Aldape configurado en .env.local
        $destinatario = $_ENV['CONTACTO_DESTINO'] ?? 'luzaldape@gmail.com';

        $correo = (new Email())
            ->from('no-reply@luzaldape.com')   // debe coincidir con el dominio del SMTP
            ->replyTo($email)                   // responder directo al visitante
            ->to($destinatario)
            ->subject("[Tienda Tapices] {$tipo} — {$nombre}")
            ->html(
                "<h2 style='color:#a0522d;font-family:Georgia,serif'>Nuevo mensaje de contacto</h2>" .
                "<table style='font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse'>" .
                "<tr><td style='padding:6px 12px;font-weight:bold;color:#666'>Nombre</td><td style='padding:6px 12px'>" . htmlspecialchars($nombre) . "</td></tr>" .
                "<tr><td style='padding:6px 12px;font-weight:bold;color:#666'>Correo</td><td style='padding:6px 12px'><a href='mailto:{$email}'>" . htmlspecialchars($email) . "</a></td></tr>" .
                "<tr><td style='padding:6px 12px;font-weight:bold;color:#666'>Tipo</td><td style='padding:6px 12px'>" . htmlspecialchars($tipo) . "</td></tr>" .
                "<tr><td style='padding:6px 12px;font-weight:bold;color:#666;vertical-align:top'>Mensaje</td><td style='padding:6px 12px'>" . nl2br(htmlspecialchars($mensaje)) . "</td></tr>" .
                "</table>" .
                "<hr style='margin:24px 0;border:none;border-top:1px solid #ddd'>" .
                "<p style='font-size:12px;color:#999'>Mensaje enviado desde el formulario de contacto de luzaldape.com</p>"
            );

        try {
            $mailer->send($correo);
        } catch (\Exception $e) {
            return $this->json(['error' => 'No se pudo enviar el correo. Intenta de nuevo más tarde.'], 500);
        }

        return $this->json(['mensaje' => 'Correo enviado correctamente']);
    }
}