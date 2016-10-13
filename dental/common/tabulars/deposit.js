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
import {Deposit} from '../collections/deposit.js';

// Page
Meteor.isClient && require('../../imports/pages/deposit.html');

tabularOpts.name = 'dental.deposit';
tabularOpts.collection = Deposit;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Dental_depositAction},
    {data: "_id", title: "ID"},
    {
        data: "paidDate",
        title: "Paid Date",
        render: function (val, type, doc) {
            return moment(val).format('DD/MM/YYYY');
        }
    },
    {data: "dueAmount", title: "Due Amount"},
    {data: 'items', title: 'Items', tmpl: Meteor.isClient && Template.Dental_depositItem},
];
export const DepositTabular = new Tabular.Table(tabularOpts);
