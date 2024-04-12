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
