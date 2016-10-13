import {Meteor} from 'meteor/meteor';
import {Templet} from 'meteor/templating';
import {Tabular} from 'meteor/aldeed:tabular';
import {EJSON} from 'meteor/ejson';
import {moment} from 'meteor/momentjs:moment';
import {_} from 'meteor/erasaur:meteor-lodash';
import {numeral} from 'meteor/numeral:numeral';
import {lightbox} from 'meteor/theara:lightbox-helpers';

// Lib
import {tabularOpts} from '../../../core/common/libs/tabular-opts.js';

// Collection
import {Register} from '../collections/register.js';

// Page
Meteor.isClient && require('../../imports/pages/register.html');

tabularOpts.name = 'dental.register';
tabularOpts.collection = Register;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Dental_registerAction},
    {data: "_id", title: "ID"},
    {
        data: "registerDate",
        title: "Date",
        render: function (val, type, doc) {
            return moment(val).format('DD/MM/YYYY');
        }
    },
    {data: "total", title: "Total"},
    {data: "des", title: "Description"},
    {data: "patientId", title: "Patient"},
    {
        title: "Status",
        tmpl: Meteor.isClient && Template.Dental_statusLinkAction
    },
    {
        title: "Deposit / Payment",
        tmpl: Meteor.isClient && Template.Dental_depositAndPaymentLinkAction
    }
];
tabularOpts.extraFields=['closedDate','items'];
export const RegisterTabular = new Tabular.Table(tabularOpts);
