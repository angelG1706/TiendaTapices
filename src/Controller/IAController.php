<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class IAController extends AbstractController
{
    #[Route('/api/admin/generar-descripcion', name: 'api_ia_generar_descripcion', methods: ['POST'])]
    public function generarDescripcion(Request $request): JsonResponse
    {
        $datos     = json_decode($request->getContent(), true);
        $titulo    = trim($datos['titulo']    ?? '');
        $tecnica   = trim($datos['tecnica']   ?? '');
        $medidas   = trim($datos['medidas']   ?? '');
        $coleccion = trim($datos['coleccion'] ?? '');

        if (!$titulo) {
            return $this->json(['error' => 'El título es obligatorio'], 400);
        }

        $apiKey = $_ENV['GEMINI_API_KEY'] ?? null;

        if (!$apiKey) {
            return $this->json(['error' => 'API key de Gemini no configurada'], 500);
        }

        $prompt = "Eres el asistente de Luz Aldape, artista textil mexicana con más de 40 años de trayectoria, "
            . "especialista en tapices artesanales de alto lizo y otras técnicas textiles, radicada en el Puerto de Veracruz, México.\n\n"
            . "Genera una descripción poética, evocadora y comercial para uno de sus tapices con las siguientes características:\n\n"
            . "Título: {$titulo}\n"
            . "Técnica: " . ($tecnica   ?: 'tapiz textil artesanal') . "\n"
            . "Medidas: " . ($medidas   ?: 'no especificadas') . "\n"
            . "Colección: " . ($coleccion ?: 'no especificada') . "\n\n"
            . "La descripción debe:\n"
            . "- Tener entre 60 y 90 palabras\n"
            . "- Capturar la esencia artística y artesanal de la obra\n"
            . "- Usar un tono cálido, elegante y cercano\n"
            . "- Mencionar la técnica de forma natural si es relevante\n"
            . "- Ser directamente usable en la tienda sin modificaciones\n"
            . "- Estar escrita en español\n\n"
            . "Escribe únicamente la descripción, sin títulos, etiquetas ni explicaciones adicionales.";

        $payload = json_encode([
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'maxOutputTokens' => 200,
                'temperature'     => 0.8,
            ],
        ]);

        #$url = '"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' . $apiKey;
        #$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $apiKey;
        #$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=' . $apiKey;
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' . $apiKey;
        error_log('URL generada: ' . $url);
        error_log('API Key: [' . $apiKey . ']');

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT        => 30,
        ]);

        $respuesta  = curl_exec($ch);
        $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError  = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            return $this->json(['error' => 'Error de conexión con Gemini: ' . $curlError], 500);
        }

        $data = json_decode($respuesta, true);

        if ($httpStatus !== 200) {
            $detalle = $data['error']['message'] ?? 'Error desconocido';
            return $this->json(['error' => 'Gemini respondió con error: ' . $detalle], 500);
        }

        $texto = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

        if (!$texto) {
            return $this->json(['error' => 'Gemini no devolvió texto'], 500);
        }

        return $this->json(['descripcion' => trim($texto)]);
    }
}