import { StackOperation, StackOptions } from 'rokka/dist/apis/stacks';
import { Expression } from 'rokka/dist/apis/expressions';

export interface StackConfig {
	stackName: string;
	operations: string[];
	width: number;
	height: number;
	quality: number;
}

// We need to use this interface instead of rokka's own because of an enum module import issue
export enum ResizeMode {
	Box = 'box',
	Fill = 'fill',
	Absolute = 'absolute',
}

export interface Stack {
	name: string;
	config: {
		operations?: StackOperation[];
		options?: StackOptions;
		expressions?: Expression[];
	};
}
