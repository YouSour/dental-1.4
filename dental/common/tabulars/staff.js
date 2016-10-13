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
import {Staff} from '../collections/staff.js';

// Page
Meteor.isClient && require('../../imports/pages/staff.html');

tabularOpts.name = 'dental.staff';
tabularOpts.collection = Staff;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Dental_staffAction},
    {data: "_id", title: "ID"},
    {data: "name", title: "Name"},
    {data: "gender", title: "Gender"},
    {data: "position", title: "Position"},
    {
        data: "startDate",
        title: "Start Date",
        render: function (val, type, doc) {
            return moment(val).format('DD/MM/YYYY');
        }
    },
    {data: "address", title: "Address"},
    {data: 'contact', title: 'Contact', tmpl: Meteor.isClient && Template.Dental_staffContact},
];
export const StaffTabular = new Tabular.Table(tabularOpts);
