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
import {DiseaseItems} from '../collections/disease-items.js';

// Page
Meteor.isClient && require('../../imports/pages/disease-items.html');

tabularOpts.name = 'dental.diseaseItems';
tabularOpts.collection = DiseaseItems;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Dental_diseaseItemsAction},
    {data: "_id", title: "ID"},
    {data: "name", title: "Name"},
    {data: "price", title: "Price"},
    {data: "memberPrice", title: "Member Price"},
    {data: "diseaseCategoriesId", title: "Categories"}
];
export const DiseaseItemsTabular = new Tabular.Table(tabularOpts);
