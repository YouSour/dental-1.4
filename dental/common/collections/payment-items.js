import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {ReactiveVar} from 'meteor/reactive-var';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';

// Method
import {lookupPaymentItems} from '../../common/methods/lookup-register.js';

export const PaymentItemsSchema = new SimpleSchema({
    itemId: {
        type: String,
        label: 'Item',
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Please search... (limit 10)',
                optionsMethod: 'dental.selectOptsMethod.diseaseItems'
            }
        }
    },
    amount: {
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
    labo: {
        type: String,
        label: "Labo Id"
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
        label: "Doctor Id"
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
    },
    paidAmount: {
        type: Number,
        label: "Paid Amount",
        decimal: true,
        min: 0,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    doctorPaid: {
        type: Number,
        decimal: true,
        optional: true
    },
    doctorBalance: {
        type: Number,
        decimal: true,
        optional: true
    },
    laboPaid: {
        type: Number,
        decimal: true,
        optional: true
    },
    laboBalance: {
        type: Number,
        decimal: true,
        optional: true
    },
    balance:{
        type: Number,
        label: "Balance",
        decimal: true,
        min:0
    }
});
