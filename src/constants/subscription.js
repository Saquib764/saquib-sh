
export const SUBSCRIPTIONS = {
  FREE: 'FREE',
  PRO: 'PRO',
  BASIC: 'BASIC',
}

export const QR_SUBSCRIPTIONS = [{
//   id: 'FREE',
//   is_subscription: false,
//   shouldShowBuyButton: false,
//   price: "0",
//   title: "New sign-up",
//   deliverables: [
//     {
//       text: '5 welcome credits, no expiry'
//     },
//     {
//       text: 'Auto-improve QR scannibility'
//     },
//     {
//       text: "Magic prompt suggestion/improvement",
//       unavailable: true
//     },
//     {
//       text: "Download without watermark",
//       unavailable: true
//     }
//   ],
// }, {
//   id: 'prod_OpU1C030mz9T2m',
//   is_subscription: false,
//   shouldShowBuyButton: true,
//   price: '2',
//   title: "Starter pass",
//   buttonText: "Buy now",
//   payment_link: `https://buy.stripe.com/00g8zD8XXbPJfO88wS`,
//   deliverables: [
//     {
//       text: '10 credits, valid for 2 days',
//     },
//     {
//       text: 'Auto-improve QR scannibility'
//     },
//     {
//       text: "Download without watermark"
//     }
//   ],
// }, {
  id: 'prod_OfKbn3EuJ8PNsY',
  is_subscription: false,
  shouldShowBuyButton: true,
  price: '5',
  title: "Basic pass",
  buttonText: "Buy now",
  payment_link: `https://buy.stripe.com/7sI2bf8XX5rl0TebIY`,
  deliverables: [
    {
      text: '30 credits, valid for 7 days',
    },
    {
      text: 'Auto-improve QR scannibility'
    },
    {
      text: "Download without watermark"
    }
  ],
}, {
  id: 'prod_OfKkh91qYhTGXR',
  is_subscription: false,
  shouldShowBuyButton: true,
  isPopular: true,
  price: '10',
  title: "Standard pass",
  buttonText: "Buy now",
  payment_link: `https://buy.stripe.com/14k0370rrg5ZbxS8wN`,
  deliverables: [
    {
      text: '60 credits, valid for 30 days',
    },
    {
      text: 'Auto-improve QR scannibility'
    },
    {
      text: "Download without watermark"
    }
  ],
}, {
  id: 'prod_Oi5ay4VkBM7M85',
  is_subscription: false,
  shouldShowBuyButton: true,
  price: '19',
  title: "Express pass",
  buttonText: "Buy now",
  payment_link: `https://buy.stripe.com/fZeaHLgqp071cBWaER`,
  deliverables: [
    {
      text: '200 credits, valid for 90 days',
    },
    {
      text: 'Auto-improve QR scannibility'
    },
    {
      text: "Download without watermark"
    }
  ],
// }, {
//   id: 'custom',
//   shouldShowBuyButton: true,
//   price: '99+',
//   is_subscription: false,
//   title: "Enterprise",
//   buttonText: "Contact sales",
//   payment_link: `https://view.forms.app/saquibalam/contact-zust-qr`,
//   deliverables: [
//     {
//       text: 'Configurable credits'
//     },
//     {
//       text: 'Prompt guidance'
//     },
//     {
//       text: 'Dedicated support'
//     }
//   ],
}]

export const PHOTOSHIFT_SUBSCRIPTIONS = [{
  id: 'FREE',
  is_subscription: true,
  is_subscription: false,
  shouldShowBuyButton: false,
  price: "0",
  title: "Free account",
  deliverables: [
    {
      text: '3 welcome credits, no expiry'
    },
    {
      text: 'Supported upto 512x512 resolution'
    },
    {
      text: 'Upscaling upto 2x',
      unavailable: true
    },
  ],
},{
  id: 'prod_Og7vySHlC6Lu1M',
  shouldShowBuyButton: true,
  price: '20',
  isPopular: true,
  title: "Starter plan",
  payment_link: `https://buy.stripe.com/eVa6rveihdXR45q28q`,
  deliverables: [
    {
      text: '50 credits per month'
    },
    {
      text: 'Supported upto 1024x1024 resolution'
    },
    {
      text: 'Upscaling upto 2x',
    }
  ],
}, {
  id: 'prod_OpBzGQbyHMEksY',
  shouldShowBuyButton: true,
  is_subscription: false,
  price: '99',
  title: "Standard plan",
  payment_link: `https://buy.stripe.com/eVa7vzeih9HBfO83cx`,
  deliverables: [
    {
      text: '400 credits per month'
    },
    {
      text: 'Supported upto 1024x1024 resolution'
    },
    {
      text: 'Upscaling upto 2x',
    }
  ],
}, {
  id: 'custom',
  shouldShowBuyButton: true,
  price: '1000+',
  is_subscription: false,
  title: "Enterprise",
  buttonText: "Contact sales",
  payment_link: `https://view.forms.app/saquibalam/contact-photoshift`,
  deliverables: [
    {
      text: 'Configurable credits'
    },
    {
      text: 'API access'
    },
    {
      text: 'Dedicated support'
    }
  ],
}]

export const ZUST_SUBSCRIPTIONS = [{
  id: 'FREE',
  is_subscription: true,
  shouldShowBuyButton: false,
  price: "0",
  title: "Free account",
  deliverables: [
    {
      text: '20 welcome credits, no expiry'
    }
  ],
},{
  id: 'prod_OMSSu4rlh8wwHG',
  shouldShowBuyButton: true,
  price: '20',
  title: "Starter plan",
  payment_link: `https://buy.stripe.com/eVa4jna21aLF7hCcMV`,
  deliverables: [
    {
      text: '100 credits per month'
    }
  ],
}, {
  id: 'prod_Orr1VCP4Rz64c5',
  shouldShowBuyButton: true,
  price: '49',
  title: "Standard plan",
  payment_link: `https://buy.stripe.com/00g8zD5LLaLF7hC6oL`,
  deliverables: [
    {
      text: '400 credits per month'
    }
  ],
}, {
  id: 'custom',
  shouldShowBuyButton: true,
  price: '1000+',
  is_subscription: false,
  title: "Enterprise",
  buttonText: "Contact sales",
  payment_link: `https://view.forms.app/saquibalam/contact-zust`,
  deliverables: [
    {
      text: 'Configurable credits'
    },
    {
      text: 'Dedicated support'
    }
  ],
}]
