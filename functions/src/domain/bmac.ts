namespace Bmac {

  export interface Supporter {
    support_id: 3975130;
    support_note: null;
    support_coffees: 1;
    transaction_id: 'pi_hitherekenobi';
    support_visibility: 1;
    support_created_on: '2022-06-05 18:50:50';
    support_updated_on: '2022-06-05 18:50:50';
    transfer_id: null;
    supporter_name: 'Someone';
    support_coffee_price: '5.0000';
    support_email: null;
    is_refunded: null;
    support_currency: 'USD';
    referer: 'https://ksp-visual-calculator.blaarkies.com/';
    country: 'US';
    order_payload: null;
    support_hidden: 0;
    refunded_at: null;
    payer_email: 'test@testmail.com';
    payment_platform: 'stripe';
    payer_name: 'Someone';
  }

  export interface V1SupportersResponse {
    first_page_url: 'https://developers.buymeacoffee.com/api/v1/supporters?page=1';
    from: 1;
    last_page: 6;
    last_page_url: 'https://developers.buymeacoffee.com/api/v1/supporters?page=6';
    next_page_url: 'https://developers.buymeacoffee.com/api/v1/supporters?page=2';
    path: 'https://developers.buymeacoffee.com/api/v1/supporters';
    per_page: 5;
    prev_page_url: null;
    to: 5;
    total: 6;
    data: Supporter[];
  }

  export interface WebhookRequest {
    supporter_email: string;
    number_of_coffees: number;
    total_amount: number;
    support_created_on: Date;
  }


}
