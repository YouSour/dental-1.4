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
import {LaboratoryItems} from '../collections/laboratory-items.js';

// Page
Meteor.isClient && require('../../imports/pages/laboratory-items.html');

tabularOpts.name = 'dental.laboratoryItems';
tabularOpts.collection = LaboratoryItems;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Dental_laboratoryItemsAction},
    {data: "_id", title: "ID"},
    {data: "name", title: "Name"},
    {data: "price", title: "Price"},
    {data: "des", title: "Description"}
];
export const LaboratoryItemsTabular = new Tabular.Table(tabularOpts);
