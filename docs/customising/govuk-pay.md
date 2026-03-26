---
layout: page
title: GOV.UK Pay integration
---

# GOV.UK Pay integration

GOV.UK Pay can be used as a payment gateway for WasteWorks services such as
garden waste subscriptions and bulky collections. It follows the same
architecture as the existing SCP (Capita) and Adelante integrations.

## Files

- **`perllib/Integrations/GOVUKPay.pm`** — HTTP client for the GOV.UK Pay
  REST API (create payments, query status, search).
- **`perllib/FixMyStreet/Roles/Cobrand/GOVUKPay.pm`** — Moo::Role that
  implements the standard payment gateway interface
  (`waste_cc_has_redirect`, `waste_cc_get_redirect_url`,
  `waste_cc_check_payment_status`, etc.).

## Cobrand setup

To use GOV.UK Pay in a cobrand, add the role and implement the required
`waste_cc_payment_reference` method:

```perl
package FixMyStreet::Cobrand::YourCouncil;
use parent 'FixMyStreet::Cobrand::UKCouncils';
use Moo;

with 'FixMyStreet::Roles::Cobrand::GOVUKPay';
with 'FixMyStreet::Roles::Cobrand::Waste';

sub waste_cc_payment_reference {
    my ($self, $p) = @_;
    return 'FMS-' . $p->id;
}

1;
```

## Configuration

Add the following to `conf/general.yml`:

```yaml
COBRAND_FEATURES:
  waste:
    yourcouncil: 1
  payment_gateway:
    yourcouncil:
      govukpay_api_key: 'your-live-or-test-api-key'
      govukpay_api_url: 'https://publicapi.payments.service.gov.uk'
      govukpay_description_prefix: 'Your Council'
      log_ident: 'yourcouncil_govukpay'
```

For testing, use the sandbox API key from the GOV.UK Pay admin console.

## Payment flow

1. User selects a paid service (garden waste, bulky collection, etc.)
2. Waste controller calls `waste_cc_get_redirect_url()`
3. GOV.UK Pay API creates the payment and returns a `next_url`
4. User is redirected to the GOV.UK Pay hosted payment page
5. After payment, user is redirected to `/waste/pay_complete/{id}/{token}`
6. Waste controller calls `waste_cc_check_payment_status()`
7. GOV.UK Pay API returns the strongly-consistent payment status
8. On success, the report is confirmed via `waste_confirm_payment()`

## Background reconciliation

The `CheckPayments` cron script has been updated to look for the
`govukpay_id` metadata key (set by the GOVUKPay role) in addition to the
existing `scpReference` and `apnReference` keys. When found, it calls
`cc_check_payment_and_update` on the cobrand to query the GOV.UK Pay API
and confirm the payment.

See `perllib/FixMyStreet/Script/Waste/CheckPayments.pm`.

## GOV.UK Pay API reference

| Endpoint | Method | Consistency |
|---|---|---|
| `/v1/payments` | POST | Strongly consistent |
| `/v1/payments/{id}` | GET | Strongly consistent |
| `/v1/payments` | GET (search) | Eventually consistent |

**Strongly consistent** means the response always reflects the very latest
state of the payment — if a user just completed payment, the API will
immediately return the updated status. This is what we use on the
`pay_complete` callback to verify the result.

**Eventually consistent** means the response may be briefly out of date.
The search endpoint can take a short time to reflect recent changes, so it
is only used for bulk lookups (e.g. reconciliation) where a small delay is
acceptable.

Full docs: <https://docs.payments.service.gov.uk/>
