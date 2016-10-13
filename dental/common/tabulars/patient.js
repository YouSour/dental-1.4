import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {Tabular} from 'meteor/aldeed:tabular';
import {EJSON} from 'meteor/ejson';
import {moment} from 'meteor/momentjs:moment';
import {_} from 'meteor/erasaur:meteor-lodash';
import {numeral} from 'meteor/numeral:numeral';
import {lightbox} from 'meteor/theara:lightbox-helpers';

// Lib
import {tabularOpts} from '../../../core/common/libs/tabular-opts.js';

// Collection
import {Patient} from '../collections/patient.js';

// Page
Meteor.isClient && require('../../imports/pages/patient.html');

tabularOpts.name = 'dental.patient';
tabularOpts.collection = Patient;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Dental_patientAction},
    {data: "_id", title: "ID"},
    {data: "name", title: "Name"},
    {data: "gender", title: "Gender"},
    {data: "age", title: "Age"},
    {data: 'contact', title: 'Contact', tmpl: Meteor.isClient && Template.Dental_patientContact},
    {data: "member", title: "Member"},
    {
        data: "photo",
        title: "Photo",
        render: function (val, type, doc) {
            if (val) {
                let img = Files.findOne(val);
                if (img) {
                    return lightbox(img.url(), doc._id, doc.name);
                }
            }

            return null;
        }
    }
];
tabularOpts.extraFields = ['caseHistory','occupation','address','des'];
export const PatientTabular = new Tabular.Table(tabularOpts);
