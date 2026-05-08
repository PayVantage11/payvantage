<?php
use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

final class PayVantage_Blocks_Integration extends AbstractPaymentMethodType {

    private $gateway;
    protected $name = 'payvantage';

    public function initialize() {
        $this->settings = get_option( 'woocommerce_payvantage_settings', array() );
        $gateways = WC()->payment_gateways->payment_gateways();
        $this->gateway  = isset( $gateways[ $this->name ] ) ? $gateways[ $this->name ] : null;
    }

    public function is_active() {
        return $this->gateway && $this->gateway->is_available();
    }

    public function get_payment_method_script_handles() {
        wp_register_script(
            'payvantage-blocks-integration',
            plugin_dir_url( __FILE__ ) . 'checkout-block.js',
            array(
                'wc-blocks-registry',
                'wc-settings',
                'wp-element',
                'wp-html-entities',
                'wp-i18n',
            ),
            null,
            true
        );

        return array( 'payvantage-blocks-integration' );
    }

    public function get_payment_method_data() {
        return array(
            'title'       => $this->get_setting( 'title' ),
            'description' => $this->get_setting( 'description' ),
            'supports'    => $this->gateway ? array_filter( $this->gateway->supports, array( $this->gateway, 'supports' ) ) : array(),
        );
    }
}
