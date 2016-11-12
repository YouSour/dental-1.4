import {
    Meteor
} from 'meteor/meteor';
import {
    Mongo
} from 'meteor/mongo';
import {
    SimpleSchema
} from 'meteor/aldeed:simple-schema';
import {
    AutoForm
} from 'meteor/aldeed:autoform';
import {
    moment
} from 'meteor/momentjs:moment';

// Lib
import {
    __
} from '../../../core/common/libs/tapi18n-callback-helper.js';
import {
    SelectOpts
} from '../../imports/libs/select-opts.js';

export const Register = new Mongo.Collection("dental_register");

// Items sub schema
Register.itemsSchema = new SimpleSchema({
    itemId: {
        type: String,
        label: 'Item'
    },
    date: {
        type: Date,
        label: 'Date',
        defaultValue: moment().toDate(),
        autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    format: 'DD/MM/YYYY',
                    showTodayButton: true
                }
            }
        },
        optional: true
    },
    qty: {
        type: Number,
        label: 'Qty',
        min: 1
    },
    price: {
        type: Number,
        label: 'Price',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    discount: {
        type: Number,
        label: "Discount",
        min: 0,
        max: 100,
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.percentage();
            }
        }
    },
    amount: {
        type: Number,
        label: 'Amount',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    labo: {
        type: String,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Please search... (limit 10)',
                optionsMethod: 'dental.selectOptsMethod.laboItems'
            }
        },
        optional: true
    },
    laboAmount: {
        type: Number,
        label: "Labo Amount",
        decimal: true,
        min: 0,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        },
        optional: true
    },
    doctor: {
        type: String,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Please search... (limit 10)',
                optionsMethod: 'dental.selectOptsMethod.doctor'
            }
        },
        optional: true
    },
    doctorAmount: {
        type: Number,
        label: "Doctor Amount",
        decimal: true,
        min: 0,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        },
        optional: true
    }
});

// Register schema
Register.schema = new SimpleSchema({
    registerDate: {
        type: Date,
        label: 'Register date',
        defaultValue: moment().toDate(),
        autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    format: 'DD/MM/YYYY',
                    showTodayButton: true
                }
            }
        }
    },
    patientId: {
        type: String,
        label: 'Patient',
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Select One',
                optionsMethod: 'dental.selectOptsMethod.patient',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        let currentBranch = Session.get('currentBranch');
                        return {
                            branchId: currentBranch
                        };
                    }
                }
            }
        }
    },
    des: {
        type: String,
        label: 'Description',
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'summernote',
                class: 'editor', // optional
                settings: {
                    height: 56, // set editor height
                    minHeight: null, // set minimum height of editor
                    maxHeight: null, // set maximum height of editor
                    toolbar: [
                        ['font', ['bold', 'italic', 'underline', 'clear']], //['font', ['bold', 'italic', 'underline', 'clear']],
                        ['para', ['ul', 'ol']] //['para', ['ul', 'ol', 'paragraph']],
                        //['insert', ['link', 'picture']], //['insert', ['link', 'picture', 'hr']],
                    ]
                } // summernote options goes here
            }
        }
    },
    items: {
        type: [Register.itemsSchema],
    },
    subTotal: {
        type: Number,
        label: 'Total',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    total: {
        type: Number,
        label: 'Total',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    closedDate: {
        type: Date,
        autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    format: 'DD/MM/YYYY',
                    showTodayButton: true
                }
            }
        },
        optional: true
    },
    depositStatus: {
        type: String,
        optional: true
    },
    paymentStatus: {
        type: String,
        optional: true
    },
    paymentCondition: {
        type: String,
        defaultValue: "partial"
    },
    branchId: {
        type: String
    }
});

Register.attachSchema(Register.schema);