import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Method
import {SelectOptsMethod} from '../../../common/methods/select-opts-method';

// Lib
import {SelectOpts} from '../../../imports/libs/select-opts.js';

export const DiseaseSchema = new SimpleSchema({
    branchId: {
        type: [String],
        label: 'Branch',
        autoform: {
            type: "select2",
            multiple: true,
            options: function () {
                return SelectOpts.branch(false);
            }
        }
    },
    repDate: {
        type: [Date],
        label: 'Date',
        autoform: {
            type: "bootstrap-daterangepicker",
            afFieldInput: {
                dateRangePickerOptions: function () {
                    return dateRangePickerOptions;
                }
            }
        }
    }
});
