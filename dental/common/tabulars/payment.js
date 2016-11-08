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
import {Payment} from '../collections/payment.js';

// Page
Meteor.isClient && require('../../imports/pages/payment.html');

tabularOpts.name = 'dental.payment';
tabularOpts.collection = Payment;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Dental_paymentAction},
    {data: "_id", title: "ID"},
    {
        data: "paidDate",
        title: "Paid Date",
        render: function (val, type, doc) {
            return moment(val).format('DD/MM/YYYY');
        }
    },
    {data: 'items', title: 'Items', tmpl: Meteor.isClient && Template.Dental_paymentItem},
    {data: "amount", title: "Total Amount"},
    {data: "totalBalance", title: "Total Balance"},
    {
        data: "condition", title: "Condition",
        render(val, type, doc){
            if (val == "Partial") {
                return `<span class="badge bg-orange-active"><i class="fa fa-heart-o"></i> ${val} </span>`;
            }
            return `<span class="badge bg-teal-active"><i class="fa fa-heart"></i> ${val} </span>`;
        }
    },
];
tabularOpts.extraFields = ['registerId', 'patientId', 'staffId'];
export const PaymentTabular = new Tabular.Table(tabularOpts);
