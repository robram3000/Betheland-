const statusOptions = {
    active: [
        'available',
        'active',
        'new listing',
        'price reduced',
        'hot listing',
        'featured',
        'exclusive',
        'coming soon',
        'motivated seller'
    ],
    pending: [
        'pending',
        'under contract',
        'contingent',
        'pending inspection',
        'pending appraisal',
        'pending financing',
        'active under contract',
        'active option contract',
        'reserved'
    ],
    sold: [
        'sold',
        'closed',
        'leased',
        'rented'
    ],
    inactive: [
        'off-market',
        'withdrawn',
        'expired',
        'canceled',
        'terminated',
        'hold',
        'draft'
    ],
    special: [
        'auction',
        'foreclosure',
        'short sale',
        'bank owned',
        'REO',
        'probate',
        'estate sale',
        'relocation',
        'as-is'
    ],
    condition: [
        'under renovation',
        'under construction',
        'pre-construction',
        'pre-launch',
        'occupied',
        'vacant'
    ],
    administrative: [
        'in review',
        'needs approval'
    ]
};
export const {
   active,sold, condition, administrative, inactive , pending , 
} = statusOptions;


export default statusOptions;