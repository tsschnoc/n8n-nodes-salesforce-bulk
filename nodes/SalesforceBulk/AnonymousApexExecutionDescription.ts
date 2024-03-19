import type { INodeProperties } from 'n8n-workflow';

export const anonymousApexExecutionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['anonymousApexExecution'],
			},
		},
		options: [
			{
				name: 'Execute Anonymous Apex',
				value: 'executeApex',
				description: 'Execute anonymous Apex code',
				action: 'Execute anonymous apex',
			},
		],
		default: 'executeApex',
	},
];

export const anonymousApexExecutionFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                anonymousApexExecution:executeApex                         */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Apex Code',
		name: 'apexCode',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['anonymousApexExecution'],
				operation: ['executeApex'],
			},
		},
		description: 'The Apex code to execute',
	},


];
