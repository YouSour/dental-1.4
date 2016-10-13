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
import {DiseaseCategories} from '../collections/disease-categories.js';

// Page
Meteor.isClient && require('../../imports/pages/disease-categories.html');

tabularOpts.name = 'dental.diseaseCategories';
tabularOpts.collection = DiseaseCategories;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Dental_diseaseCategoriesAction},
    {data: "_id", title: "ID"},
    {data: "name", title: "Name"},
    {data: "des", title: "Description"}
];
export const DiseaseCategoriesTabular = new Tabular.Table(tabularOpts);
