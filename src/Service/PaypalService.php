<?php
namespace App\Service;

class PaypalService
{
    private string $clientId;
    private string $secret;
    private string $baseUrl;

    public function __construct(string $clientId, string $secret, string $mode)
    {
        $this->clientId = $clientId;
        $this->secret   = $secret;
        $this->baseUrl  = $mode === 'sandbox'
            ? 'https://api-m.sandbox.paypal.com'
            : 'https://api-m.paypal.com';
    }

    public function getAccessToken(): string
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/v1/oauth2/token');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, 'grant_type=client_credentials');
        curl_setopt($ch, CURLOPT_USERPWD, $this->clientId . ':' . $this->secret);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
        $response = json_decode(curl_exec($ch), true);
        curl_close($ch);
        return $response['access_token'];
    }

    public function crearOrden(float $monto): array
    {
        $token = $this->getAccessToken();
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/v2/checkout/orders');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'intent' => 'CAPTURE',
            'purchase_units' => [[
                'amount' => [
                    'currency_code' => 'MXN',
                    'value' => number_format($monto / 100, 2, '.', ''),
                ]
            ]]
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token,
        ]);
        $response = json_decode(curl_exec($ch), true);
        curl_close($ch);
        return $response;
    }

    public function capturarOrden(string $orderId): array
    {
        $token = $this->getAccessToken();
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/v2/checkout/orders/' . $orderId . '/capture');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, '{}');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token,
        ]);
        $response = json_decode(curl_exec($ch), true);
        curl_close($ch);
        return $response;
    }
}