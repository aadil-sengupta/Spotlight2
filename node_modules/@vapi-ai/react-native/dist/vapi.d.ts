import type { OpenAI } from 'openai';
import EventEmitter from 'events';
import { DailyCall, DailyParticipant } from '@daily-co/react-native-daily-js';
import { Call, CreateAssistantDTO, CreateSquadDTO, AssistantOverrides, CreateWorkflowDTO, WorkflowOverrides } from './api';
export interface AddMessageMessage {
    type: 'add-message';
    message: OpenAI.ChatCompletionMessageParam;
}
export interface ControlMessages {
    type: 'control';
    control: 'mute-assistant' | 'unmute-assistant' | 'say-first-message';
    videoRecordingStartDelaySeconds?: number;
}
export interface SayMessage {
    type: 'say';
    message: string;
    endCallAfterSpoken?: boolean;
    interruptionsEnabled?: boolean;
    interruptAssistantEnabled?: boolean;
}
type VapiClientToServerMessage = AddMessageMessage | ControlMessages | SayMessage;
type VapiEventNames = 'call-end' | 'call-start' | 'volume-level' | 'speech-start' | 'speech-end' | 'message' | 'video' | 'error' | 'camera-error' | 'network-quality-change' | 'network-connection' | 'daily-participant-updated' | 'call-start-progress' | 'call-start-success' | 'call-start-failed';
interface CallStartProgressEvent {
    stage: string;
    status: 'started' | 'completed' | 'failed';
    duration?: number;
    timestamp: string;
    metadata?: Record<string, any>;
}
interface CallStartSuccessEvent {
    totalDuration: number;
    callId?: string;
    timestamp: string;
}
interface CallStartFailedEvent {
    stage: string;
    totalDuration: number;
    error: string;
    errorStack?: string;
    timestamp: string;
    context: Record<string, any>;
}
type VapiEventListeners = {
    'call-end': () => void;
    'call-start': () => void;
    'volume-level': (volume: number) => void;
    'speech-start': () => void;
    'speech-end': () => void;
    video: (track: any) => void;
    message: (message: any) => void;
    error: (error: any) => void;
    'camera-error': (error: any) => void;
    'network-quality-change': (event: any) => void;
    'network-connection': (event: any) => void;
    'daily-participant-updated': (participant: DailyParticipant) => void;
    'call-start-progress': (event: CallStartProgressEvent) => void;
    'call-start-success': (event: CallStartSuccessEvent) => void;
    'call-start-failed': (event: CallStartFailedEvent) => void;
};
declare class VapiEventEmitter extends EventEmitter {
    on<E extends VapiEventNames>(event: E, listener: VapiEventListeners[E]): this;
    once<E extends VapiEventNames>(event: E, listener: VapiEventListeners[E]): this;
    emit<E extends VapiEventNames>(event: E, ...args: Parameters<VapiEventListeners[E]>): boolean;
    removeListener<E extends VapiEventNames>(event: E, listener: VapiEventListeners[E]): this;
    removeAllListeners(event?: VapiEventNames): this;
}
export default class Vapi extends VapiEventEmitter {
    private started;
    private call;
    private cameraDeviceValue;
    private cameraDeviceItems;
    private audioDeviceValue;
    private audioDevicesItems;
    private speakingTimeout;
    private hasEmittedCallEndedStatus;
    constructor(apiToken: string, apiBaseUrl?: string);
    private cleanup;
    private onAppMessage;
    private onJoinedMeeting;
    private onTrackStarted;
    private subscribeToTracks;
    private refreshSelectedDevice;
    private updateAvailableDevices;
    private initEventListeners;
    private removeEventListeners;
    start(assistant?: CreateAssistantDTO | string, assistantOverrides?: AssistantOverrides, squad?: CreateSquadDTO | string, workflow?: CreateWorkflowDTO | string, workflowOverrides?: WorkflowOverrides): Promise<Call | null>;
    private handleRemoteParticipantsAudioLevel;
    stop(): void;
    send(message: VapiClientToServerMessage): void;
    setMuted(mute: boolean): void;
    isMuted(): boolean;
    say(message: string, endCallAfterSpoken?: boolean, interruptionsEnabled?: boolean, interruptAssistantEnabled?: boolean): void;
    setLocalVideo(enable: boolean): void;
    isVideoEnabled(): boolean;
    startCamera(): Promise<void>;
    cycleCamera(): Promise<{
        device: {
            facingMode: import("@daily-co/react-native-daily-js").DailyCameraFacingMode;
        } | null;
    }>;
    getDailyCallObject(): DailyCall | null;
    updateParticipant(sessionId: string, updates: any): DailyCall;
    participants(): {};
    getAudioDevices(): any[];
    setAudioDevice(deviceId: string): void;
    getCurrentAudioDevice(): string | null;
    getCameraDevices(): any[];
    setCamera(deviceId: string): void;
    getCurrentCameraDevice(): string | null;
    startScreenShare(): void;
    stopScreenShare(): void;
    updateSendSettings(settings: any): void;
    updateReceiveSettings(settings: any): void;
    updateInputSettings(settings: any): void;
}
export {};
