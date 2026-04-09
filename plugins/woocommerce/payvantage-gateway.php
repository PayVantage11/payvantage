<?php
/**
 * Plugin Name: PayVantage Gateway for WooCommerce
 * Plugin URI:  https://payvantage.io/integrations/woocommerce
 * Description: Accept card payments settled in stablecoins via PayVantage.
 * Version:     1.0.0
 * Author:      PayVantage Inc.
 * Author URI:  https://payvantage.io
 * License:     GPL-2.0+
 * Text Domain: payvantage-gateway
 *
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 6.0
 * WC tested up to: 8.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'plugins_loaded', 'payvantage_gateway_init', 11 );

function payvantage_gateway_init() {
    if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
        return;
    }

    class WC_Gateway_PayVantage extends WC_Payment_Gateway {

        public function __construct() {
            $this->id                 = 'payvantage';
            $this->icon               = '';
            $this->has_fields         = false;
            $this->method_title       = __( 'PayVantage', 'payvantage-gateway' );
            $this->method_description = __( 'Accept card payments settled in stablecoins. No chargebacks, instant settlement.', 'payvantage-gateway' );

            $this->init_form_fields();
            $this->init_settings();

            $this->title           = $this->get_option( 'title' );
            $this->description     = $this->get_option( 'description' );
            $this->enabled         = $this->get_option( 'enabled' );
            $this->api_url         = $this->get_option( 'api_url' );
            $this->publishable_key = $this->get_option( 'publishable_key' );
            $this->secret_key      = $this->get_option( 'secret_key' );

            add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
        }

        public function init_form_fields() {
            $this->form_fields = array(
                'enabled' => array(
                    'title'   => __( 'Enable/Disable', 'payvantage-gateway' ),
                    'type'    => 'checkbox',
                    'label'   => __( 'Enable PayVantage Gateway', 'payvantage-gateway' ),
                    'default' => 'yes',
                ),
                'title' => array(
                    'title'       => __( 'Title', 'payvantage-gateway' ),
                    'type'        => 'text',
                    'description' => __( 'Payment method title the customer sees at checkout.', 'payvantage-gateway' ),
                    'default'     => __( 'Pay with Card (Stablecoin Settlement)', 'payvantage-gateway' ),
                    'desc_tip'    => true,
                ),
                'description' => array(
                    'title'       => __( 'Description', 'payvantage-gateway' ),
                    'type'        => 'textarea',
                    'description' => __( 'Payment method description the customer sees at checkout.', 'payvantage-gateway' ),
                    'default'     => __( 'Pay securely with your credit or debit card. Powered by PayVantage.', 'payvantage-gateway' ),
                ),
                'api_url' => array(
                    'title'       => __( 'API URL', 'payvantage-gateway' ),
                    'type'        => 'text',
                    'description' => __( 'Your PayVantage API base URL (e.g. https://yourdomain.com).', 'payvantage-gateway' ),
                    'default'     => '',
                    'desc_tip'    => true,
                ),
                'publishable_key' => array(
                    'title'       => __( 'Publishable Key', 'payvantage-gateway' ),
                    'type'        => 'text',
                    'description' => __( 'Your PayVantage publishable API key (pv_pub_...).', 'payvantage-gateway' ),
                    'default'     => '',
                    'desc_tip'    => true,
                ),
                'secret_key' => array(
                    'title'       => __( 'Secret Key', 'payvantage-gateway' ),
                    'type'        => 'password',
                    'description' => __( 'Your PayVantage secret API key (pv_sec_...).', 'payvantage-gateway' ),
                    'default'     => '',
                    'desc_tip'    => true,
                ),
            );
        }

        public function process_payment( $order_id ) {
            $order = wc_get_order( $order_id );

            $payload = array(
                'amount'           => (float) $order->get_total(),
                'currency'         => $order->get_currency(),
                'merchant_api_key' => $this->publishable_key,
            );

            $response = wp_remote_post(
                rtrim( $this->api_url, '/' ) . '/api/checkout',
                array(
                    'method'  => 'POST',
                    'headers' => array(
                        'Content-Type'  => 'application/json',
                        'Authorization' => 'Bearer ' . $this->secret_key,
                    ),
                    'body'    => wp_json_encode( $payload ),
                    'timeout' => 30,
                )
            );

            if ( is_wp_error( $response ) ) {
                wc_add_notice( __( 'Payment error: Could not connect to PayVantage.', 'payvantage-gateway' ), 'error' );
                return;
            }

            $body = json_decode( wp_remote_retrieve_body( $response ), true );

            if ( empty( $body['checkout_url'] ) ) {
                $error_msg = isset( $body['error'] ) ? $body['error'] : 'Unknown error';
                wc_add_notice( __( 'Payment error: ', 'payvantage-gateway' ) . $error_msg, 'error' );
                return;
            }

            $order->update_meta_data( '_payvantage_checkout_id', $body['checkout_id'] );
            $order->update_status( 'pending', __( 'Awaiting PayVantage payment.', 'payvantage-gateway' ) );
            $order->save();

            return array(
                'result'   => 'success',
                'redirect' => $body['checkout_url'],
            );
        }
    }

    add_filter( 'woocommerce_payment_gateways', function ( $gateways ) {
        $gateways[] = 'WC_Gateway_PayVantage';
        return $gateways;
    } );
}
