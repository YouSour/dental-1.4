import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../imports/libs/select-opts.js';
import {getLookupValue} from '../../imports/libs/get-lookup-value.js';

export const DiseaseItems = new Mongo.Collection("dental_diseaseItems");

DiseaseItems.generalSchema = new SimpleSchema({
    name: {
        type: String,
        label: 'Name',
        unique: true
    },
    price: {
        type: Number,
        label: 'Price',
        decimal: true,
        min: 0.01,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    memberPrice: {
        type: Number,
        label: 'Member Price',
        decimal: true,
        min: 0.01,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    diseaseCategoriesId: {
        type: String,
        label: 'Disease Categories',
        autoform: {
            type: 'select',
            options: function () {
                return SelectOpts.diseaseCategories();
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

DiseaseItems.attachSchema([
    DiseaseItems.generalSchema
]);
