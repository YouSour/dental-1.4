Module = typeof Module === 'undefined' ? {} : Module;

Module.Dental = {
    name: 'Dental',
    version: '2.0.0',
    summary: 'Dental is ...',
    roles: [
        'setting',
        'data-insert',
        'data-update',
        'data-remove',
        'reporter'
    ],
    dump: {
        setting: [
            'dental_location'
        ],
        data: [
            'dental_customer',
            'dental_order'
        ]
    }
};
