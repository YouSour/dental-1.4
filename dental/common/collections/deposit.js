import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../imports/libs/select-opts.js';

export const Deposit = new Mongo.Collection("dental_deposit");

// Items sub schema
Deposit.itemsSchema = new SimpleSchema({
    itemId: {
        type: String,
        label: 'Item'
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
        },
        optional: true
    },
    tempBalance: {
        type: Number,
        label: "Balance",
        decimal: true,
        min: 0,
        optional: true
    },
    balance: {
        type: Number,
        label: "Balance",
        decimal: true,
        min: 0,
        optional: true
    },
    status: {
        type: String,
        optional: true,
    },
});

// Deposit schema
Deposit.schema = new SimpleSchema({
    paidDate: {
        type: Date,
        label: 'Paid Date',
        // defaultValue: moment().toDate(),
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
    registerId: {
        type: String,
        label: 'Invoice',
        autoform: {
            type: 'select',
            options: function () {
                return SelectOpts.register();
            }
            // afFieldInput: {
            //     uniPlaceholder: 'Select One',
            //     optionsMethod: 'dental.selectOptsMethod.registerByPatient',
            //     optionsMethodParams: function () {
            //         if (Meteor.isClient) {
            //             let patientId = Session.get('patientId');
            //             console.log(patientId);
            //             if(patientId){
            //
            //                 // let branchId = Session.get('currentBranch');, branchId: branchId
            //                 return {patientId: patientId};
            //             }
            //         }
            //     }
            // }
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
                    height: 56,                 // set editor height
                    minHeight: null,             // set minimum height of editor
                    maxHeight: null,             // set maximum height of editor
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
        type: [Deposit.itemsSchema],
        optional: true
    },
    amount: {
        type: Number,
        label: 'Amount',
        decimal: true
    },
    totalBalance: {
        type: Number,
        label: 'Balance',
        defaultValue: 0,
        decimal: true
    },
    branchId: {
        type: String
    }
});

Deposit.attachSchema(Deposit.schema);
