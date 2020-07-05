({
    subscribe: function (cmp, event, helper) {
        const empApi = cmp.find('empApi');
        const channel = '/event/ConnectionMessage__e';
        const replayId = -1;
        const callback = function (message) {
          helper.onReceiveMessage(cmp, message);
        };
        // Subscribe to the channel and save the returned subscription object.
        empApi.subscribe(channel, replayId, $A.getCallback(callback)).then($A.getCallback(function (subs) {
          console.log('Subscribed to channel ' + channel);
        }));
      },
      onReceiveMessage: function (cmp, message){
        if(cmp.get('v.senderId')!==message.data.payload.SenderId__c){
          var sendMessage = cmp.getEvent("messageEvent");
          sendMessage.setParams({type : message.data.payload.Type__c, objString : message.data.payload.Object__c });
          sendMessage.fire();
        }else{
          console.log(message.data.payload.Type__c+':message dispatched');
        }
        

        
      },
})