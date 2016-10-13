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
import {Doctor} from '../collections/doctor.js';

// Page
Meteor.isClient && require('../../imports/pages/doctor.html');

tabularOpts.name = 'dental.doctor';
tabularOpts.collection = Doctor;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Dental_doctorAction},
    {data: "_id", title: "ID"},
    {data: "name", title: "Name"},
    {data: "gender", title: "Gender"},
    {
        data: "startDate",
        title: "Start Date",
        render: function (val, type, doc) {
            return moment(val).format('DD/MM/YYYY');
        }
    },
    {data: "address", title: "Address"},
    {data: 'contact', title: 'Contact', tmpl: Meteor.isClient && Template.Dental_doctorContact},
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
tabularOpts.extraFields = ['des'];
export const DoctorTabular = new Tabular.Table(tabularOpts);
