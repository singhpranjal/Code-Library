({
    doInit : function(cmp, event, helper) {
        let dt=new Date();
        cmp.set('v.senderId',$A.get("$SObjectType.CurrentUser.Id")+dt.getTime());
        

        setTimeout(function() {
                             
            navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
                }).then(function (stream) {  
                    var localVideo = document.getElementById('localVideo');
                    localVideo.srcObject = stream;
                    helper.createConnection(cmp);
                       
                }).catch(function (e) {
                    console.log("Problem while getting audio video stuff ",e);
        });  
        }, 2000);          
    },
       initiateOffer : function(cmp,event,helper){
            helper.initiateOffer(cmp);
       },
       sendIceCandidate : function(cmp, event, helper){
            helper.sendIceCandidate(cmp);
       },
       toggleMic: function(cmp,event,helper){
        var localVideo = document.getElementById('localVideo');
        localVideo.srcObject.getTracks().forEach(t => t.enabled = !t.enabled);
       },
       handleReceivedMessage : function(cmp, event, helper){
        console.log(event.getParam("type"));
        console.log(event.getParam("objString"));
        switch(event.getParam("type")) {
            case 'OFFER':
              helper.receiveOffer(cmp,event.getParam("objString"));
              break;
            case 'ANSWER':
                //alert('answer received');
                helper.receiveAnswer(cmp,event.getParam("objString"));
              break;
            case 'ICECANDIDATE':
                //alert('ice candidates received');
                helper.receiveIceCandidate(cmp,event.getParam("objString"));
                break;
            case 'REJECTED':
                alert('Person you are trying to call is busy, Please try later.');
          }
       }
})