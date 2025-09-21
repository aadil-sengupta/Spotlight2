"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const react_native_daily_js_1 = __importDefault(require("@daily-co/react-native-daily-js"));
const apiClient_1 = require("./apiClient");
class VapiEventEmitter extends events_1.default {
    on(event, listener) {
        super.on(event, listener);
        return this;
    }
    once(event, listener) {
        super.once(event, listener);
        return this;
    }
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
    removeListener(event, listener) {
        super.removeListener(event, listener);
        return this;
    }
    removeAllListeners(event) {
        super.removeAllListeners(event);
        return this;
    }
}
class Vapi extends VapiEventEmitter {
    started = false;
    call = null;
    cameraDeviceValue = null;
    cameraDeviceItems = [];
    audioDeviceValue = null;
    audioDevicesItems = [];
    speakingTimeout = null;
    hasEmittedCallEndedStatus = false;
    constructor(apiToken, apiBaseUrl) {
        super();
        apiClient_1.apiClient.baseUrl = apiBaseUrl ?? 'https://api.vapi.ai';
        apiClient_1.apiClient.setSecurityData(apiToken);
    }
    async cleanup() {
        if (!this.call)
            return;
        this.removeEventListeners();
        this.started = false;
        this.hasEmittedCallEndedStatus = false;
        await this.call.destroy();
        this.call = null;
        this.speakingTimeout = null;
        this.emit('call-end');
    }
    onAppMessage(e) {
        if (!e) {
            return;
        }
        try {
            if (e.data === 'listening') {
                return this.emit('call-start');
            }
            else {
                try {
                    const parsedMessage = JSON.parse(e.data);
                    this.emit('message', parsedMessage);
                    if (parsedMessage && 'type' in parsedMessage && 'status' in parsedMessage &&
                        parsedMessage.type === 'status-update' && parsedMessage.status === 'ended') {
                        this.hasEmittedCallEndedStatus = true;
                    }
                }
                catch (parseError) {
                    console.log('Error parsing message data: ', parseError);
                }
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    onJoinedMeeting() {
        this.call?.enumerateDevices().then(({ devices }) => {
            this.updateAvailableDevices(devices);
            this.emit('call-start');
        });
    }
    onTrackStarted(e) {
        if (!e ||
            !e.participant ||
            e.participant?.local ||
            e?.participant?.user_name !== 'Vapi Speaker') {
            return;
        }
        if (e.track.kind === 'video') {
            this.emit('video', e.track);
        }
        this.call?.sendAppMessage('playable');
    }
    subscribeToTracks(e, isVideoRecordingEnabled, isVideoEnabled) {
        if (e.participant.local || !this.call)
            return;
        this.call.updateParticipant(e.participant.session_id, {
            setSubscribedTracks: {
                audio: true,
                video: isVideoRecordingEnabled || isVideoEnabled,
            },
        });
    }
    async refreshSelectedDevice() {
        const devicesInUse = await this.call?.getInputDevices();
        const cameraDevice = devicesInUse?.camera;
        if (devicesInUse && cameraDevice?.deviceId) {
            try {
                this.cameraDeviceValue = cameraDevice.deviceId;
                this.call?.setCamera(this.cameraDeviceValue);
            }
            catch (error) {
                console.error('error setting camera device', error);
            }
        }
        const speakerDevice = devicesInUse?.speaker;
        if (devicesInUse && speakerDevice?.deviceId) {
            try {
                this.audioDeviceValue = speakerDevice.deviceId;
                await this.call?.setAudioDevice(this.audioDeviceValue);
            }
            catch (error) {
                console.error('error setting audio device', error);
            }
        }
    }
    updateAvailableDevices(devices) {
        const inputDevices = devices
            ?.filter((device) => device.kind === 'videoinput')
            .map((device) => {
            return {
                value: device.deviceId,
                label: device.label,
                originalValue: device,
            };
        });
        this.cameraDeviceItems = inputDevices || [];
        const outputDevices = devices
            ?.filter((device) => device.kind === 'audio')
            .map((device) => {
            return {
                value: device.deviceId,
                label: device.label,
                originalValue: device,
            };
        });
        this.audioDevicesItems = outputDevices || [];
        this.refreshSelectedDevice();
    }
    initEventListeners(isVideoRecordingEnabled, isVideoEnabled) {
        if (!this.call)
            return;
        this.call.on('available-devices-updated', (e) => {
            this.updateAvailableDevices(e?.availableDevices);
        });
        this.call.on('app-message', (e) => {
            this.onAppMessage(e);
        });
        this.call.on('track-started', (e) => {
            this.onTrackStarted(e);
        });
        this.call.on('participant-joined', (e) => {
            if (!e || !this.call)
                return;
            this.subscribeToTracks(e, isVideoRecordingEnabled, isVideoEnabled);
        });
        this.call.on('participant-updated', (e) => {
            if (!e)
                return;
            this.emit('daily-participant-updated', e.participant);
        });
        this.call.on('participant-left', (e) => {
            this.cleanup();
        });
        this.call.on('left-meeting', (e) => {
            if (!this.hasEmittedCallEndedStatus) {
                this.emit('message', {
                    type: 'status-update',
                    status: 'ended',
                    'endedReason': 'customer-ended-call',
                });
                this.hasEmittedCallEndedStatus = true;
            }
            if (isVideoRecordingEnabled) {
                this.call?.stopRecording();
            }
            this.cleanup();
        });
        this.call.on('error', (e) => {
            this.emit('error', e);
            if (isVideoRecordingEnabled) {
                this.call?.stopRecording();
            }
            this.cleanup();
        });
        this.call.on('camera-error', (e) => {
            this.emit('camera-error', e);
        });
        this.call.on('network-quality-change', (e) => {
            this.emit('network-quality-change', e);
        });
        this.call.on('network-connection', (e) => {
            this.emit('network-connection', e);
        });
        this.call.on('joined-meeting', (e) => {
            this.onJoinedMeeting();
        });
        this.call.on('nonfatal-error', (e) => {
            // Handle audio processor errors
            if (e?.type === 'audio-processor-error') {
                // In React Native, we just reset audio without processor settings
                this.call?.setLocalAudio(true);
            }
        });
    }
    removeEventListeners() {
        if (!this.call)
            return;
        const events = [
            'available-devices-updated',
            'app-message',
            'track-started',
            'participant-joined',
            'participant-updated',
            'participant-left',
            'joined-meeting',
            'left-meeting',
            'error',
            'camera-error',
            'network-quality-change',
            'network-connection',
            'nonfatal-error',
        ];
        for (const event of events) {
            this.call.off(event, (e) => { });
        }
    }
    async start(assistant, assistantOverrides, squad, workflow, workflowOverrides) {
        const startTime = Date.now();
        // Input validation
        if (!assistant && !squad && !workflow) {
            const error = new Error('Assistant or Squad or Workflow must be provided.');
            this.emit('error', {
                type: 'validation-error',
                stage: 'input-validation',
                message: error.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
        if (this.started) {
            this.emit('call-start-progress', {
                stage: 'validation',
                status: 'failed',
                timestamp: new Date().toISOString(),
                metadata: { reason: 'already-started' }
            });
            return null;
        }
        this.emit('call-start-progress', {
            stage: 'initialization',
            status: 'started',
            timestamp: new Date().toISOString(),
            metadata: {
                hasAssistant: !!assistant,
                hasSquad: !!squad,
                hasWorkflow: !!workflow
            }
        });
        this.started = true;
        try {
            // Stage 1: Create web call
            this.emit('call-start-progress', {
                stage: 'web-call-creation',
                status: 'started',
                timestamp: new Date().toISOString()
            });
            const webCallStartTime = Date.now();
            const webCall = (await apiClient_1.apiClient.call.callControllerCreateWebCall({
                assistant: typeof assistant === 'string' ? undefined : assistant,
                assistantId: typeof assistant === 'string' ? assistant : undefined,
                assistantOverrides,
                squad: typeof squad === 'string' ? undefined : squad,
                squadId: typeof squad === 'string' ? squad : undefined,
                workflow: typeof workflow === 'string' ? undefined : workflow,
                workflowId: typeof workflow === 'string' ? workflow : undefined,
                workflowOverrides,
            })).data;
            const webCallDuration = Date.now() - webCallStartTime;
            this.emit('call-start-progress', {
                stage: 'web-call-creation',
                status: 'completed',
                duration: webCallDuration,
                timestamp: new Date().toISOString(),
                metadata: {
                    callId: webCall?.id || 'unknown',
                    videoRecordingEnabled: webCall?.artifactPlan?.videoRecordingEnabled ?? false,
                    voiceProvider: webCall?.assistant?.voice?.provider || 'unknown'
                }
            });
            // @ts-ignore this exists in the response
            const roomUrl = webCall.webCallUrl;
            if (!roomUrl) {
                throw new Error('webCallUrl is not available');
            }
            const isVideoRecordingEnabled = webCall?.artifactPlan?.videoRecordingEnabled ?? false;
            const isVideoEnabled = webCall?.assistant?.voice?.provider === 'tavus';
            // Stage 2: Create Daily call object
            this.emit('call-start-progress', {
                stage: 'daily-call-object-creation',
                status: 'started',
                timestamp: new Date().toISOString(),
                metadata: {
                    audioSource: true,
                    videoSource: isVideoRecordingEnabled || isVideoEnabled,
                    isVideoRecordingEnabled,
                    isVideoEnabled
                }
            });
            const dailyCallStartTime = Date.now();
            try {
                this.call = react_native_daily_js_1.default.createCallObject({
                    audioSource: true,
                    videoSource: isVideoRecordingEnabled || isVideoEnabled,
                });
                const dailyCallDuration = Date.now() - dailyCallStartTime;
                this.emit('call-start-progress', {
                    stage: 'daily-call-object-creation',
                    status: 'completed',
                    duration: dailyCallDuration,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                const dailyCallDuration = Date.now() - dailyCallStartTime;
                this.emit('call-start-progress', {
                    stage: 'daily-call-object-creation',
                    status: 'failed',
                    duration: dailyCallDuration,
                    timestamp: new Date().toISOString(),
                    metadata: { error: error?.toString() }
                });
                this.emit('error', {
                    type: 'daily-call-object-creation-error',
                    stage: 'daily-call-object-creation',
                    error,
                    timestamp: new Date().toISOString()
                });
                throw error;
            }
            // Stage 3: Audio level observer setup
            this.emit('call-start-progress', {
                stage: 'audio-observer-setup',
                status: 'started',
                timestamp: new Date().toISOString()
            });
            const audioObserverStartTime = Date.now();
            try {
                this.call.startRemoteParticipantsAudioLevelObserver(100);
                const audioObserverDuration = Date.now() - audioObserverStartTime;
                this.emit('call-start-progress', {
                    stage: 'audio-observer-setup',
                    status: 'completed',
                    duration: audioObserverDuration,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                const audioObserverDuration = Date.now() - audioObserverStartTime;
                this.emit('call-start-progress', {
                    stage: 'audio-observer-setup',
                    status: 'failed',
                    duration: audioObserverDuration,
                    timestamp: new Date().toISOString(),
                    metadata: { error: error?.toString() }
                });
                // Don't throw here, this is non-critical
            }
            this.call.on('remote-participants-audio-level', (e) => {
                if (e)
                    this.handleRemoteParticipantsAudioLevel(e);
            });
            this.initEventListeners(isVideoRecordingEnabled, isVideoEnabled);
            // Stage 4: Join the call
            this.emit('call-start-progress', {
                stage: 'daily-call-join',
                status: 'started',
                timestamp: new Date().toISOString()
            });
            const joinStartTime = Date.now();
            try {
                await this.call.join({
                    url: roomUrl,
                    subscribeToTracksAutomatically: false,
                });
                const joinDuration = Date.now() - joinStartTime;
                this.emit('call-start-progress', {
                    stage: 'daily-call-join',
                    status: 'completed',
                    duration: joinDuration,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                const joinDuration = Date.now() - joinStartTime;
                this.emit('call-start-progress', {
                    stage: 'daily-call-join',
                    status: 'failed',
                    duration: joinDuration,
                    timestamp: new Date().toISOString(),
                    metadata: { error: error?.toString() }
                });
                this.emit('error', {
                    type: 'daily-call-join-error',
                    stage: 'daily-call-join',
                    error,
                    duration: joinDuration,
                    timestamp: new Date().toISOString()
                });
                throw error;
            }
            // Stage 5: Video recording setup (if enabled)
            if (isVideoRecordingEnabled) {
                this.emit('call-start-progress', {
                    stage: 'video-recording-setup',
                    status: 'started',
                    timestamp: new Date().toISOString()
                });
                const recordingRequestedTime = new Date().getTime();
                const recordingStartTime = Date.now();
                try {
                    this.call.startRecording({
                        width: 1280,
                        height: 720,
                        backgroundColor: '#FF1F2D3D',
                        layout: {
                            preset: 'default',
                        },
                    });
                    const recordingSetupDuration = Date.now() - recordingStartTime;
                    this.emit('call-start-progress', {
                        stage: 'video-recording-setup',
                        status: 'completed',
                        duration: recordingSetupDuration,
                        timestamp: new Date().toISOString()
                    });
                    this.call.on('recording-started', () => {
                        const totalRecordingDelay = (new Date().getTime() - recordingRequestedTime) / 1000;
                        this.emit('call-start-progress', {
                            stage: 'video-recording-started',
                            status: 'completed',
                            timestamp: new Date().toISOString(),
                            metadata: { delaySeconds: totalRecordingDelay }
                        });
                        this.send({
                            type: 'control',
                            control: 'say-first-message',
                            videoRecordingStartDelaySeconds: totalRecordingDelay,
                        });
                    });
                }
                catch (error) {
                    const recordingSetupDuration = Date.now() - recordingStartTime;
                    this.emit('call-start-progress', {
                        stage: 'video-recording-setup',
                        status: 'failed',
                        duration: recordingSetupDuration,
                        timestamp: new Date().toISOString(),
                        metadata: { error: error?.toString() }
                    });
                    // Don't throw here, video recording is optional
                }
            }
            // Stage 6: Audio processing setup - skipped in React Native
            this.emit('call-start-progress', {
                stage: 'audio-processing-setup',
                status: 'completed',
                timestamp: new Date().toISOString(),
                metadata: { action: 'skipped-not-supported-rn' }
            });
            const totalDuration = Date.now() - startTime;
            this.emit('call-start-success', {
                totalDuration,
                callId: webCall?.id || 'unknown',
                timestamp: new Date().toISOString()
            });
            return webCall;
        }
        catch (e) {
            const totalDuration = Date.now() - startTime;
            this.emit('call-start-failed', {
                stage: 'unknown',
                totalDuration,
                error: e?.toString() || 'Unknown error occurred',
                errorStack: e instanceof Error ? e.stack : 'No stack trace available',
                timestamp: new Date().toISOString(),
                context: {
                    hasAssistant: !!assistant,
                    hasSquad: !!squad,
                    hasWorkflow: !!workflow,
                }
            });
            console.error(e);
            this.emit('error', e);
            this.cleanup();
            return null;
        }
    }
    handleRemoteParticipantsAudioLevel(e) {
        const speechLevel = Object.values(e.participantsAudioLevel).reduce((a, b) => a + b, 0);
        this.emit('volume-level', Math.min(1, speechLevel / 0.15));
        const isSpeaking = speechLevel > 0.01;
        if (!isSpeaking) {
            return;
        }
        if (this.speakingTimeout) {
            clearTimeout(this.speakingTimeout);
            this.speakingTimeout = null;
        }
        else {
            this.emit('speech-start');
        }
        this.speakingTimeout = setTimeout(() => {
            this.emit('speech-end');
            this.speakingTimeout = null;
        }, 1000);
    }
    stop() {
        this.cleanup();
    }
    send(message) {
        this.call?.sendAppMessage(JSON.stringify(message));
    }
    setMuted(mute) {
        try {
            if (!this.call) {
                throw new Error('Call object is not available.');
            }
            this.call.setLocalAudio(!mute);
        }
        catch (error) {
            throw error;
        }
    }
    isMuted() {
        try {
            if (!this.call) {
                return false;
            }
            return this.call.localAudio() === false;
        }
        catch (error) {
            throw error;
        }
    }
    say(message, endCallAfterSpoken, interruptionsEnabled, interruptAssistantEnabled) {
        this.send({
            type: 'say',
            message,
            endCallAfterSpoken,
            interruptionsEnabled: interruptionsEnabled ?? false,
            interruptAssistantEnabled: interruptAssistantEnabled ?? false,
        });
    }
    setLocalVideo(enable) {
        try {
            if (!this.call) {
                throw new Error('Call object is not available.');
            }
            this.call.setLocalVideo(enable);
        }
        catch (error) {
            throw error;
        }
    }
    isVideoEnabled() {
        try {
            if (!this.call) {
                return false;
            }
            return this.call.localVideo() === true;
        }
        catch (error) {
            throw error;
        }
    }
    startCamera() {
        try {
            if (!this.call) {
                throw new Error('Call object is not available.');
            }
            return this.call.startCamera();
        }
        catch (error) {
            throw error;
        }
    }
    cycleCamera() {
        try {
            if (!this.call) {
                throw new Error('Call object is not available.');
            }
            return this.call.cycleCamera();
        }
        catch (error) {
            throw error;
        }
    }
    getDailyCallObject() {
        return this.call;
    }
    updateParticipant(sessionId, updates) {
        try {
            if (!this.call) {
                throw new Error('Call object is not available.');
            }
            return this.call.updateParticipant(sessionId, updates);
        }
        catch (error) {
            throw error;
        }
    }
    participants() {
        try {
            if (!this.call) {
                return {};
            }
            return this.call.participants();
        }
        catch (error) {
            throw error;
        }
    }
    getAudioDevices() {
        return this.audioDevicesItems;
    }
    setAudioDevice(deviceId) {
        this.audioDeviceValue = deviceId;
        this.call?.setAudioDevice(this.audioDeviceValue);
    }
    getCurrentAudioDevice() {
        return this.audioDeviceValue;
    }
    getCameraDevices() {
        return this.cameraDeviceItems;
    }
    setCamera(deviceId) {
        this.cameraDeviceValue = deviceId;
        this.call?.setCamera(this.cameraDeviceValue);
    }
    getCurrentCameraDevice() {
        return this.cameraDeviceValue;
    }
    startScreenShare() {
        try {
            if (!this.call) {
                throw new Error('Call object is not available.');
            }
            return this.call.startScreenShare();
        }
        catch (error) {
            throw error;
        }
    }
    stopScreenShare() {
        try {
            if (!this.call) {
                throw new Error('Call object is not available.');
            }
            return this.call.stopScreenShare();
        }
        catch (error) {
            throw error;
        }
    }
    updateSendSettings(settings) {
        try {
            if (!this.call) {
                throw new Error('Call object is not available.');
            }
            this.call.updateSendSettings(settings);
        }
        catch (error) {
            throw error;
        }
    }
    updateReceiveSettings(settings) {
        try {
            if (!this.call) {
                throw new Error('Call object is not available.');
            }
            this.call.updateReceiveSettings(settings);
        }
        catch (error) {
            throw error;
        }
    }
    updateInputSettings(settings) {
        try {
            if (!this.call) {
                throw new Error('Call object is not available.');
            }
            this.call.updateInputSettings(settings);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = Vapi;
