let callbacks = {
    onRegister: null,
    onLogin: null,
    onRefresh: null,
    onLogout: null,
    onValidate: null
}
function registerCallback(event, fn) {
    if (callbacks.hasOwnProperty(event)) {
        callbacks[event] = fn;

    } else {
        throw new Error(`Callback event '${event}' is not supported.`)
    }
}
function getCallback (event){
    return callbacks[event]
};
module.exports = {
    registerCallback,
    getCallback
}