import type {
	IExecuteFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, deepCopy } from 'n8n-workflow';
import {/*  Builder,  */Parser } from 'xml2js';

import { customObjectFields, customObjectOperations } from './CustomObjectDescription';
import { anonymousApexExecutionOperations, anonymousApexExecutionFields } from './AnonymousApexExecutionDescription';

import {
	getQuery,
	salesforceApiRequest,
	salesforceApiRequestAllItems,
	sortOptions,
} from './GenericFunctions';

import {
	csvToJSON,
	jsonToCSV
} from './CSVFunctions';


export class SalesforceBulk implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Salesforce Bulk',
		name: 'salesforceBulk',
		icon: 'file:salesforce.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Salesforce API',
		defaults: {
			name: 'SalesforceBulk',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'salesforceOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
			{
				name: 'salesforceJwtApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['jwt'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
					{
						name: 'OAuth2 JWT',
						value: 'jwt',
					},
				],
				default: 'oAuth2',
				description: 'OAuth Authorization Flow',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Custom Object',
						value: 'customObject',
						description: 'Represents a custom object',
					},
					{
						name: 'Execute Anonymous Apex',
						value: 'anonymousApexExecution',
						description: 'Executes anonymous Apex code',
					},
				],
				default: 'customObject',
			},
			...customObjectOperations,
			...customObjectFields,
			...anonymousApexExecutionOperations,
			...anonymousApexExecutionFields
		],
	};

	methods = {
		loadOptions: {
			// Get all the lead statuses to display them to user so that they can
			// select them easily
			async getLeadStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const qs = {
					q: 'SELECT id, MasterLabel FROM LeadStatus',
				};
				const statuses = await salesforceApiRequestAllItems.call(
					this,
					'records',
					'GET',
					'/query',
					{},
					qs,
				);
				for (const status of statuses) {
					const statusName = status.MasterLabel;
					returnData.push({
						name: statusName,
						value: statusName,
					});
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the users to display them to user so that they can
			// select them easily
			async getUsers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const qs = {
					q: 'SELECT id, Name FROM User',
				};
				const users = await salesforceApiRequestAllItems.call(
					this,
					'records',
					'GET',
					'/query',
					{},
					qs,
				);
				for (const user of users) {
					const userName = user.Name;
					const userId = user.Id;
					returnData.push({
						name: userName,
						value: userId,
					});
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the users and case queues to display them to user so that they can
			// select them easily
			async getCaseOwners(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const qsQueues = {
					q: "SELECT Queue.Id, Queue.Name FROM QueuesObject where Queue.Type='Queue' and SobjectType = 'Case'",
				};
				const queues = await salesforceApiRequestAllItems.call(
					this,
					'records',
					'GET',
					'/query',
					{},
					qsQueues,
				);
				for (const queue of queues) {
					const queueName = queue.Queue.Name;
					const queueId = queue.Queue.Id;
					returnData.push({
						name: `Queue: ${queueName}`,
						value: queueId,
					});
				}
				const qsUsers = {
					q: 'SELECT id, Name FROM User',
				};
				const users = await salesforceApiRequestAllItems.call(
					this,
					'records',
					'GET',
					'/query',
					{},
					qsUsers,
				);
				const userPrefix = returnData.length > 0 ? 'User: ' : '';
				for (const user of users) {
					const userName = user.Name;
					const userId = user.Id;
					returnData.push({
						name: userPrefix + (userName as string),
						value: userId,
					});
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the users and lead queues to display them to user so that they can
			// select them easily
			async getLeadOwners(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const qsQueues = {
					q: "SELECT Queue.Id, Queue.Name FROM QueuesObject where Queue.Type='Queue' and SobjectType = 'Lead'",
				};
				const queues = await salesforceApiRequestAllItems.call(
					this,
					'records',
					'GET',
					'/query',
					{},
					qsQueues,
				);
				for (const queue of queues) {
					const queueName = queue.Queue.Name;
					const queueId = queue.Queue.Id;
					returnData.push({
						name: `Queue: ${queueName}`,
						value: queueId,
					});
				}
				const qsUsers = {
					q: 'SELECT id, Name FROM User',
				};
				const users = await salesforceApiRequestAllItems.call(
					this,
					'records',
					'GET',
					'/query',
					{},
					qsUsers,
				);
				const userPrefix = returnData.length > 0 ? 'User: ' : '';
				for (const user of users) {
					const userName = user.Name;
					const userId = user.Id;
					returnData.push({
						name: userPrefix + (userName as string),
						value: userId,
					});
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the lead sources to display them to user so that they can
			// select them easily
			async getLeadSources(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/lead/describe');

				for (const field of fields) {
					if (field.name === 'LeadSource') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the lead custom fields to display them to user so that they can
			// select them easily
			async getCustomFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const resource = this.getNodeParameter('resource', 0);
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(
					this,
					'GET',
					`/sobjects/${resource}/describe`,
				);
				for (const field of fields) {
					if (field.custom === true) {
						const fieldName = field.label;
						const fieldId = field.name;
						returnData.push({
							name: fieldName,
							value: fieldId,
						});
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the record types to display them to user so that they can
			// select them easily
			async getRecordTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				let resource = this.getNodeParameter('resource', 0);
				if (resource === 'customObject') {
					resource = this.getNodeParameter('customObject', 0) as string;
				}
				const qs = {
					q: `SELECT Id, Name, SobjectType, IsActive FROM RecordType WHERE SobjectType = '${resource}'`,
				};
				const types = await salesforceApiRequestAllItems.call(
					this,
					'records',
					'GET',
					'/query',
					{},
					qs,
				);
				for (const type of types) {
					if (type.IsActive === true) {
						returnData.push({
							name: type.Name,
							value: type.Id,
						});
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the external id fields to display them to user so that they can
			// select them easily
			async getExternalIdFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				let resource = this.getCurrentNodeParameter('resource') as string;
				resource =
					resource === 'customObject'
						? (this.getCurrentNodeParameter('customObject') as string)
						: resource;
				const { fields } = await salesforceApiRequest.call(
					this,
					'GET',
					`/sobjects/${resource}/describe`,
				);
				for (const field of fields) {
					if (field.externalId === true || field.idLookup === true) {
						const fieldName = field.label;
						const fieldId = field.name;
						returnData.push({
							name: fieldName,
							value: fieldId,
						});
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the accounts to display them to user so that they can
			// select them easily
			async getAccounts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const qs = {
					q: 'SELECT id, Name FROM Account',
				};
				const accounts = await salesforceApiRequestAllItems.call(
					this,
					'records',
					'GET',
					'/query',
					{},
					qs,
				);
				for (const account of accounts) {
					const accountName = account.Name;
					const accountId = account.Id;
					returnData.push({
						name: accountName,
						value: accountId,
					});
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the campaigns to display them to user so that they can
			// select them easily
			async getCampaigns(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const qs = {
					q: 'SELECT id, Name FROM Campaign',
				};
				const campaigns = await salesforceApiRequestAllItems.call(
					this,
					'records',
					'GET',
					'/query',
					{},
					qs,
				);
				for (const campaign of campaigns) {
					const campaignName = campaign.Name;
					const campaignId = campaign.Id;
					returnData.push({
						name: campaignName,
						value: campaignId,
					});
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the stages to display them to user so that they can
			// select them easily
			async getStages(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(
					this,
					'GET',
					'/sobjects/opportunity/describe',
				);
				for (const field of fields) {
					if (field.name === 'StageName') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the stages to display them to user so that they can
			// select them easily
			async getAccountTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(
					this,
					'GET',
					'/sobjects/account/describe',
				);
				for (const field of fields) {
					if (field.name === 'Type') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the account sources to display them to user so that they can
			// select them easily
			async getAccountSources(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(
					this,
					'GET',
					'/sobjects/account/describe',
				);
				for (const field of fields) {
					if (field.name === 'AccountSource') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the case types to display them to user so that they can
			// select them easily
			async getCaseTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/case/describe');
				for (const field of fields) {
					if (field.name === 'Type') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the case statuses to display them to user so that they can
			// select them easily
			async getCaseStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/case/describe');
				for (const field of fields) {
					if (field.name === 'Status') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the case reasons to display them to user so that they can
			// select them easily
			async getCaseReasons(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/case/describe');
				for (const field of fields) {
					if (field.name === 'Reason') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the case origins to display them to user so that they can
			// select them easily
			async getCaseOrigins(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/case/describe');
				for (const field of fields) {
					if (field.name === 'Origin') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the case priorities to display them to user so that they can
			// select them easily
			async getCasePriorities(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/case/describe');
				for (const field of fields) {
					if (field.name === 'Priority') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the task statuses to display them to user so that they can
			// select them easily
			async getTaskStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
				for (const field of fields) {
					if (field.name === 'Status') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the task types to display them to user so that they can
			// select them easily
			async getTaskTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
				for (const field of fields) {
					if (field.name === 'TaskSubtype') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the task subjects to display them to user so that they can
			// select them easily
			async getTaskSubjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
				for (const field of fields) {
					if (field.name === 'Subject') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the task call types to display them to user so that they can
			// select them easily
			async getTaskCallTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
				for (const field of fields) {
					if (field.name === 'CallType') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the task call priorities to display them to user so that they can
			// select them easily
			async getTaskPriorities(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
				for (const field of fields) {
					if (field.name === 'Priority') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the task recurrence types to display them to user so that they can
			// select them easily
			async getTaskRecurrenceTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
				for (const field of fields) {
					if (field.name === 'RecurrenceType') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the task recurrence instances to display them to user so that they can
			// select them easily
			async getTaskRecurrenceInstances(
				this: ILoadOptionsFunctions,
			): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
				for (const field of fields) {
					if (field.name === 'RecurrenceInstance') {
						for (const pickValue of field.picklistValues) {
							const pickValueName = pickValue.label;
							const pickValueId = pickValue.value;
							returnData.push({
								name: pickValueName,
								value: pickValueId,
							});
						}
					}
				}
				sortOptions(returnData);
				return returnData;
			},

			// Get all the custom objects recurrence instances to display them to user so that they can
			// select them easily
			async getCustomObjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { sobjects: objects } = await salesforceApiRequest.call(this, 'GET', '/sobjects');
				for (const object of objects) {
					//if (object.custom === true) {
						const objectName = object.label;
						const objectId = object.name;
						returnData.push({
							name: objectName,
							value: objectId,
						});
					//}
				}
				sortOptions(returnData);
				return returnData;
			},

			// Get all the custom objects fields recurrence instances to display them to user so that they can
			// select them easily
			async getCustomObjectFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const customObject = this.getCurrentNodeParameter('customObject') as string;
				const { fields } = await salesforceApiRequest.call(
					this,
					'GET',
					`/sobjects/${customObject}/describe`,
				);
				for (const field of fields) {
					const fieldName = field.label;
					const fieldId = field.name;
					returnData.push({
						name: fieldName,
						value: fieldId,
					});
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the account fields recurrence instances to display them to user so that they can
			// select them easily
			async getAccountFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(
					this,
					'GET',
					'/sobjects/account/describe',
				);
				for (const field of fields) {
					const fieldName = field.label;
					const fieldId = field.name;
					returnData.push({
						name: fieldName,
						value: fieldId,
					});
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the attachment fields recurrence instances to display them to user so that they can
			// select them easily
			async getAtachmentFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(
					this,
					'GET',
					'/sobjects/attachment/describe',
				);
				for (const field of fields) {
					const fieldName = field.label;
					const fieldId = field.name;
					returnData.push({
						name: fieldName,
						value: fieldId,
					});
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the case fields recurrence instances to display them to user so that they can
			// select them easily
			async getCaseFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/case/describe');
				for (const field of fields) {
					const fieldName = field.label;
					const fieldId = field.name;
					returnData.push({
						name: fieldName,
						value: fieldId,
					});
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the lead fields recurrence instances to display them to user so that they can
			// select them easily
			async getLeadFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/lead/describe');
				for (const field of fields) {
					const fieldName = field.label;
					const fieldId = field.name;
					returnData.push({
						name: fieldName,
						value: fieldId,
					});
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the opportunity fields recurrence instances to display them to user so that they can
			// select them easily
			async getOpportunityFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(
					this,
					'GET',
					'/sobjects/opportunity/describe',
				);
				for (const field of fields) {
					const fieldName = field.label;
					const fieldId = field.name;
					returnData.push({
						name: fieldName,
						value: fieldId,
					});
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the opportunity fields recurrence instances to display them to user so that they can
			// select them easily
			async getTaskFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
				for (const field of fields) {
					const fieldName = field.label;
					const fieldId = field.name;
					returnData.push({
						name: fieldName,
						value: fieldId,
					});
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the users fields recurrence instances to display them to user so that they can
			// select them easily
			async getUserFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(this, 'GET', '/sobjects/user/describe');
				for (const field of fields) {
					const fieldName = field.label;
					const fieldId = field.name;
					returnData.push({
						name: fieldName,
						value: fieldId,
					});
				}
				sortOptions(returnData);
				return returnData;
			},
			// Get all the contact fields recurrence instances to display them to user so that they can
			// select them easily
			async getContactFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				// TODO: find a way to filter this object to get just the lead sources instead of the whole object
				const { fields } = await salesforceApiRequest.call(
					this,
					'GET',
					'/sobjects/contact/describe',
				);
				for (const field of fields) {
					const fieldName = field.label;
					const fieldId = field.name;
					returnData.push({
						name: fieldName,
						value: fieldId,
					});
				}
				sortOptions(returnData);
				return returnData;
			},
			// // Get all folders to display them to user so that they can
			// // select them easily
			// async getFolders(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
			// 	const returnData: INodePropertyOptions[] = [];
			// 	const fields = await salesforceApiRequestAllItems.call(this, 'records', 'GET', '/sobjects/folder/describe');
			// 	console.log(JSON.stringify(fields, undefined, 2))
			// 	const qs = {
			// 		//ContentFolderItem ContentWorkspace ContentFolder
			// 		q: `SELECT Id, Title FROM ContentVersion`,
			// 		//q: `SELECT Id FROM Folder where Type = 'Document'`,

			// 	};
			// 	const folders = await salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
			// 	for (const folder of folders) {
			// 		returnData.push({
			// 			name: folder.Name,
			// 			value: folder.Id,
			// 		});
			// 	}
			// 	return returnData;
			// },
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		let responseData;
		const qs: IDataObject = {};
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);
		var useBulkApi;
		try {
			useBulkApi = this.getNodeParameter('useBulkApi', 0);
		}
		catch (error) {

		}

		// this.logger.debug(
		// 	`Running "Salesforce" node named "${this.getNode.name}" resource "${resource}" operation "${operation}"`,
		// );

		if (operation === 'executeApex') {
			const apexCode = this.getNodeParameter('apexCode', 0) as string;
			//const encodedApexCode = encodeURIComponent(apexCode);

			const authenticationMethod = this.getNodeParameter('authentication', 0, 'oAuth2') as string;
			const credentialsType = authenticationMethod === 'jwt' ? 'salesforceJwtApi' : 'salesforceOAuth2Api';

			const credentials = await this.getCredentials(credentialsType);

			const c = JSON.parse(JSON.stringify(credentials));
			let refresh_token = c.oauthTokenData.refresh_token;

			let authResponseData = await this.helpers.request({
				"headers": {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				"method": "POST",
				"qs": {},
				"uri": c.authUrl.split('/services')[0] + "/services/oauth2/token",
				"json": false,
				"body" : `grant_type=refresh_token&refresh_token=${refresh_token}&client_id=${credentials.clientId}`
			});


			let ar = JSON.parse(authResponseData);
			let accessToken = ar.access_token;

			const match = ar.id.match(/\/id\/(00D\w+)\//);
			const orgId = match ? match[1] : null;


			const b = `<env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema"
			xmlns:env="http://schemas.xmlsoap.org/soap/envelope/"
			xmlns:cmd="http://soap.sforce.com/2006/08/apex"
			xmlns:apex="http://soap.sforce.com/2006/08/apex">
					<env:Header>
							<cmd:SessionHeader>
									<cmd:sessionId>${accessToken}</cmd:sessionId>
							</cmd:SessionHeader>
							<apex:DebuggingHeader>
									<apex:debugLevel>DEBUGONLY</apex:debugLevel>
							</apex:DebuggingHeader>
					</env:Header>
					<env:Body>
							<executeAnonymous xmlns="http://soap.sforce.com/2006/08/apex">
									<apexcode>${apexCode}</apexcode>
							</executeAnonymous>
					</env:Body>
			</env:Envelope>`;

			var options = {
				"headers": {
					"Content-Type": "text/xml; charset=utf-8",
					"soapaction": "executeAnonymous"
				},
				"method": "POST",
				"qs": {},
				"uri": `${ar.instance_url}/services/Soap/s/60.0/${orgId}`,
				"json": false,
				"body" : b
			};




			responseData = await this.helpers.request(options);

			const parserOptions = Object.assign(
				{
					mergeAttrs: true,
					explicitArray: false,
				},
				options,
			);

			const parser = new Parser(parserOptions);
			const json = await parser.parseStringPromise(responseData);
			returnData.push({ json: deepCopy(json) });
			return [returnData];
		}

		if (useBulkApi === true) {

			const customObject = this.getNodeParameter('customObject', 0) as string;
			const bodies: IDataObject[] = [];

			for (let i = 0; i < items.length; i++) {
				const body: IDataObject = {};
				bodies.push(body);
				if (operation === 'delete' )	{
					body.Id = this.getNodeParameter('recordId', i) as string;
				}
				else {
					const customFieldsUi = this.getNodeParameter('customFieldsUi', i) as IDataObject;
					const additionalFields = this.getNodeParameter('additionalFields', i);
					if (customFieldsUi) {
						const customFields = customFieldsUi.customFieldsValues as IDataObject[];
						if (customFields) {
							for (const customField of customFields) {
								body[customField.fieldId as string] = customField.value;
							}
						}
					}
					if (additionalFields.recordTypeId) {
						body.RecordTypeId = additionalFields.recordTypeId as string;
					}

					if (operation === 'upsert' )	{
						const externalIdValue = this.getNodeParameter('externalIdValue', i) as string;
						const externalId = this.getNodeParameter('externalId', 0) as string;
						body[externalId] = externalIdValue;
					}
				}
			}




			let body: { object: string; contentType: string; operation: string; lineEnding: string; externalIdFieldName?: string; } = {
				"object" : customObject,
				"contentType" : "CSV",
				"operation" : {
					"create" : "insert",
					"update" : "update",
					"delete" : "delete",
					"upsert" : "upsert"
				}[operation] || 'nooperation',
				"lineEnding" : "CRLF"
			};
			if (operation === 'upsert' )	{
				const externalId = this.getNodeParameter('externalId', 0) as string;
				body.externalIdFieldName = externalId;
			}

			let createBatch  = await salesforceApiRequest.call(this, 'POST', '/jobs/ingest/', body);
			console.log('createBatch', createBatch);
			console.log('createBatch.contentUrl', createBatch.contentUrl);


			let plainBody = jsonToCSV(bodies);

			let uploadCsvResponse  = await salesforceApiRequest.call(this, 'PUT', `/jobs/ingest/${createBatch.id}/batches`, plainBody, undefined,
				undefined, {headers:{'Content-Type': 'text/csv'}});

			console.log('uploadCsvResponse', uploadCsvResponse);

			let closeBatchResponse  = await salesforceApiRequest.call(this, 'PATCH', `/jobs/ingest/${createBatch.id}/`, {"state":"UploadComplete"});
			console.log('closeBatchResponse', closeBatchResponse);

			let statusResponse = await salesforceApiRequest.call(this, 'GET', `/jobs/ingest/${createBatch.id}/`);

			const waitForJobCompletion = async () => {
				while (statusResponse.state !== 'JobComplete' && statusResponse.state !== 'falied' && statusResponse.state !== 'Aborted' && statusResponse.state !== 'Not Processed' && statusResponse.state !== 'Failed') {
					await new Promise(resolve => setTimeout(resolve, 2000));
					statusResponse = await salesforceApiRequest.call(this, 'GET', `/jobs/ingest/${createBatch.id}/`);
				}
			};

			await waitForJobCompletion();

			let successfulResults  = await salesforceApiRequest.call(this, 'GET', `/jobs/ingest/${createBatch.id}/successfulResults/`);
			const successfulResultsArray = csvToJSON(successfulResults);

			successfulResultsArray.forEach((element: any) => {
				element.success = true;
				returnData.push({json: element});
			});


			//failedResults
			let failedResults  = await salesforceApiRequest.call(this, 'GET', `/jobs/ingest/${createBatch.id}/failedResults/`);
			const failedResultsArray = csvToJSON(failedResults);

			failedResultsArray.forEach((element: any) => {
				element.success = false;
				returnData.push({json: element});
			});

			// returnData.push({"json":{"errors":[],"success":true, id:'sdfsdf'},"pairedItem":{"item":0}});
			// returnData.push({"json":{"errors":[],"success":true},"pairedItem":{"item":0}});
			return [returnData];
		}
		// this.logger.debug(
		// 	`Running "Salesforce" node named "${this.getNode.name}" resource "${resource}" operation "${operation}"`,
		// );

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'customObject') {
					if (operation === 'create' || operation === 'upsert') {
						const customObject = this.getNodeParameter('customObject', i) as string;
						const customFieldsUi = this.getNodeParameter('customFieldsUi', i) as IDataObject;
						const additionalFields = this.getNodeParameter('additionalFields', i);
						const body: IDataObject = {};
						if (customFieldsUi) {
							const customFields = customFieldsUi.customFieldsValues as IDataObject[];
							if (customFields) {
								for (const customField of customFields) {
									body[customField.fieldId as string] = customField.value;
								}
							}
						}
						if (additionalFields.recordTypeId) {
							body.RecordTypeId = additionalFields.recordTypeId as string;
						}
						let endpoint = `/sobjects/${customObject}`;
						let method = 'POST';
						if (operation === 'upsert') {
							method = 'PATCH';
							const externalId = this.getNodeParameter('externalId', 0) as string;
							const externalIdValue = this.getNodeParameter('externalIdValue', i) as string;
							endpoint = `/sobjects/${customObject}/${externalId}/${externalIdValue}`;
							if (body[externalId] !== undefined) {
								delete body[externalId];
							}
						}
						responseData = await salesforceApiRequest.call(this, method, endpoint, body);
					}
					if (operation === 'update') {
						const recordId = this.getNodeParameter('recordId', i) as string;
						const customObject = this.getNodeParameter('customObject', i) as string;
						const customFieldsUi = this.getNodeParameter('customFieldsUi', i) as IDataObject;
						const updateFields = this.getNodeParameter('updateFields', i);
						const body: IDataObject = {};
						if (updateFields.recordTypeId) {
							body.RecordTypeId = updateFields.recordTypeId as string;
						}
						if (customFieldsUi) {
							const customFields = customFieldsUi.customFieldsValues as IDataObject[];
							if (customFields) {
								for (const customField of customFields) {
									body[customField.fieldId as string] = customField.value;
								}
							}
						}
						responseData = await salesforceApiRequest.call(
							this,
							'PATCH',
							`/sobjects/${customObject}/${recordId}`,
							body,
						);
					}
					if (operation === 'get') {
						const customObject = this.getNodeParameter('customObject', i) as string;
						const recordId = this.getNodeParameter('recordId', i) as string;
						responseData = await salesforceApiRequest.call(
							this,
							'GET',
							`/sobjects/${customObject}/${recordId}`,
						);
					}
					if (operation === 'getAll') {
						const customObject = this.getNodeParameter('customObject', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i);
						const options = this.getNodeParameter('options', i);
						try {
							if (returnAll) {
								qs.q = getQuery(options, customObject, returnAll);
								responseData = await salesforceApiRequestAllItems.call(
									this,
									'records',
									'GET',
									'/query',
									{},
									qs,
								);
							} else {
								const limit = this.getNodeParameter('limit', i);
								qs.q = getQuery(options, customObject, returnAll, limit);
								responseData = await salesforceApiRequestAllItems.call(
									this,
									'records',
									'GET',
									'/query',
									{},
									qs,
								);
							}
						} catch (error) {
							throw new NodeApiError(this.getNode(), error as JsonObject);
						}
					}
					if (operation === 'delete') {
						const customObject = this.getNodeParameter('customObject', i) as string;
						const recordId = this.getNodeParameter('recordId', i) as string;
						try {
							responseData = await salesforceApiRequest.call(
								this,
								'DELETE',
								`/sobjects/${customObject}/${recordId}`,
							);
						} catch (error) {
							throw new NodeApiError(this.getNode(), error as JsonObject);
						}
					}
				}

				if (!Array.isArray(responseData) && responseData === undefined) {
					// Make sure that always valid JSON gets returned which also matches the
					// Salesforce default response
					responseData = {
						errors: [],
						success: true,
					};
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject[]),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}
		return [returnData];
	}
}
