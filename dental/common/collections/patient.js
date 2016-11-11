import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../imports/libs/select-opts.js';
import {getLookupValue} from '../../imports/libs/get-lookup-value.js';

export const Patient = new Mongo.Collection("dental_patient");

Patient.generalSchema = new SimpleSchema({
    name: {
        type: String,
        label: 'Name'
    },
    gender: {
        type: String,
        label: 'Gender',
        defaultValue: 'M',
        autoform: {
            type: "select-radio-inline",
            options: function () {
                // return SelectOpts.gender();
                return getLookupValue('Gender');
            }
        }
    },
    age: {
        type: Number,
        label: 'Age'
    },
    occupation: {
        type: String,
        label: 'Occupation',
        optional: true
    },
    caseHistory: {
        type: [String],
        label: 'Case History',
        optional: true,
        autoform: {
            type: 'select2',
            multiple: true,
            options: function () {
                return SelectOpts.caseHistory();
            }
        }
    },
    photo: {
        type: String,
        label: 'Photo',
        autoform: {
            afFieldInput: {
                type: 'fileUpload',
                collection: 'Files',
                accept: 'image/*'
            }
        },
        optional: true
    },
    address: {
        type: String,
        label: 'Address',
        optional: true

    },
    member: {
        type: String,
        label: 'Member',
        defaultValue: 'Yes',
        autoform: {
            type: 'select-radio-inline',
            options: function () {
                return getLookupValue('Member');
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
                class: 'editor',
                settings: {
                    height: 96,
                    toolbar: [
                        //[groupname, [button list]]
                        ['style', ['bold', 'italic', 'underline']],
                        ['font', ['strikethrough']],
                        ['fontsize', ['fontsize']],
                        ['color', ['color']],
                        ['para', ['ul', 'ol', 'paragraph']],
                        ['misc', ['fullscreen']],
                    ]
                }
            }
        }
    },
    branchId: {
        type: String
    }
});

Patient.contactSchema = new SimpleSchema({
    contact: {
        type: [Object],
        label: 'Contact',
        minCount: 1,
        maxCount: 3
    },
    'contact.$.type': {
        type: String,
        label: 'Type',
        autoform: {
            type: "select",
            options: function () {
                return getLookupValue('Contact Type');
            }
        }
    },
    'contact.$.number': {
        type: String,
        label: 'Number',
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.phone();
            }
        }
    },
});

Patient.attachSchema([
    Patient.generalSchema,
    Patient.contactSchema
]);
