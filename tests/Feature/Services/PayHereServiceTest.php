<?php

use App\Models\Member;
use App\Models\Payment;
use App\Models\User;
use App\Services\PayHereService;
use Illuminate\Support\Facades\Config;

beforeEach(function () {
    $this->payHereService = new PayHereService();
    
    // Set dummy config for testing
    Config::set('services.payhere.merchant_id', '123456');
    Config::set('services.payhere.merchant_secret', 'dummy_secret');
    Config::set('services.payhere.mode', 'sandbox');
});

it('generates a unique order ID for a payment', function () {
    $payment = new Payment();
    $payment->id = '999';
    
    $orderId = $this->payHereService->generateOrderId($payment);
    
    expect($orderId)->toStartWith('GOCOACH-');
    expect(strlen($orderId))->toBeGreaterThan(10);
});

it('returns correct checkout URL based on environment', function () {
    Config::set('services.payhere.mode', 'sandbox');
    expect($this->payHereService->getCheckoutUrl())->toBe('https://sandbox.payhere.lk/pay/checkout');

    Config::set('services.payhere.mode', 'production');
    expect($this->payHereService->getCheckoutUrl())->toBe('https://www.payhere.lk/pay/checkout');
});

it('generates correct checkout hash', function () {
    $orderId = 'TEST_ORDER_123';
    $amount = '1000.00';
    $currency = 'LKR';
    
    $hash = $this->payHereService->generateCheckoutHash($orderId, $amount, $currency);
    
    // MD5 logic test
    $hashedSecret = strtoupper(md5('dummy_secret'));
    $expectedHash = strtoupper(md5('123456' . $orderId . $amount . $currency . $hashedSecret));
    
    expect($hash)->toBe($expectedHash);
});

it('verifies webhook signature correctly', function () {
    $orderId = 'TEST_ORDER_123';
    $payhereAmount = '1000.00';
    $payhereCurrency = 'LKR';
    $statusCode = '2';
    
    $hashedSecret = strtoupper(md5('dummy_secret'));
    $validSignature = strtoupper(md5('123456' . $orderId . $payhereAmount . $payhereCurrency . $statusCode . $hashedSecret));
    
    $isValid = $this->payHereService->verifyWebhookSignature(
        $orderId, $payhereAmount, $payhereCurrency, $statusCode, $validSignature
    );
    
    expect($isValid)->toBeTrue();
    
    $isInvalid = $this->payHereService->verifyWebhookSignature(
        $orderId, $payhereAmount, $payhereCurrency, $statusCode, 'INVALID_SIGNATURE'
    );
    
    expect($isInvalid)->toBeFalse();
});
