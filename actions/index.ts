import {
	ActionFn,
	Context,
	Event,
	BlockEvent
} from '@tenderly/actions';
import { newSubscriptionEvent } from './src';

export const entryPoint: ActionFn = async (context: Context, event: Event) => {
	await newSubscriptionEvent(context, event)
}

export const blockHelloWorldFn: ActionFn = async (context: Context, event: Event) => {
	let blockEvent = event as BlockEvent;
	console.log(blockEvent);
}
