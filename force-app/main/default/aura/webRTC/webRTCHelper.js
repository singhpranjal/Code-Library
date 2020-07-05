({
    
    createConnection : function(cmp) {
        const helper=this;
        var localVideo = document.getElementById('localVideo');
            stream = localVideo.srcObject;
        var configuration  = {
            'configuration': {
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            },
            'iceServers': [
                            {'urls': 'stun:stun.stunprotocol.org:3478'},
                            {'urls': 'stun:stun.l.google.com:19302'}
                           // {'urls': 'stun:stun1.l.google.com:19302'},
                            //{'urls': 'stun:stun2.l.google.com:19302'}
                          ]
        };

        const peerConnection = new RTCPeerConnection(configuration);

         //peer connection state change log
         peerConnection.addEventListener('connectionstatechange', event => {
            console.log('connection state changed to '+peerConnection.connectionState);
        });

         //Fetch ICE candidates
         peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                console.log('ice candidate gathered');
                let candidateList=[];
                if(cmp.get('v.sendICECandidateDirectly')){
                    candidateList.push(event.candidate);
                    helper.sendMessage(cmp,'ICECANDIDATE',JSON.stringify(candidateList));
                }else{
                candidateList=cmp.get('v.iceCandidates');
                candidateList.push(event.candidate);
                cmp.set('v.iceCandidates',candidateList);
                }
                
            }
        });
       

        //add stream
        try {
                console.log('Stream Added');
                peerConnection.addStream(stream);
            }catch(e){
                var tracks = stream.getTracks();
                for(var i=0;i<tracks.length;i++){
                    peerConnection.addTrack(tracks[i], stream);
                }
                console.log('catch of add stream');
            }
        peerConnection.ontrack = function (e) {
                            cmp.set('v.connected',true);
                            console.log('switched view');
                            let remoteVideo=document.getElementById('remoteVideo');
                            remoteVideo.style.display="block";
                            remoteVideo.srcObject = e.streams[0];
                            
                        };   
        cmp.set('v.rtcObject',peerConnection);                       
   

    },
    initiateOffer: function(cmp){
        const peerConnection = cmp.get('v.rtcObject');
        const helper=this;
        peerConnection.createOffer().then(function(offer) {
            return peerConnection.setLocalDescription(offer);
          })
          .then(function() {
            console.log('offer sent');
            helper.sendMessage(cmp,'OFFER',JSON.stringify(peerConnection.localDescription));
          })
          .catch(function(reason) {
            console.log('error: '+ reason);
          });
       
    },
    receiveOffer : function(cmp, objString){
            if(confirm("You are getting a call. Do you want to answer?")){
                const peerConnection = cmp.get('v.rtcObject');
                const helper=this;
                peerConnection.setRemoteDescription(JSON.parse(objString))
                .then(function() {
                    return peerConnection.createAnswer();
                })
                .then(function(answer) {
                    return peerConnection.setLocalDescription(answer);
                })
                .then(function() {
                    helper.sendMessage(cmp,'ANSWER',JSON.stringify(peerConnection.localDescription));
                    console.log('answer sent');
                })
                .then(function() {
                    cmp.set('v.sendICECandidateDirectly',true);
                    if(cmp.get('v.iceCandidates').length>0){
                        console.log('ice candidate sent');
                        helper.sendMessage(cmp,'ICECANDIDATE',JSON.stringify(cmp.get('v.iceCandidates')));
                    }
                })
                .catch(function(reason) {
                    console.log('error: '+ reason);
                });
            }else{
                console.log('rejected');
                this.sendMessage(cmp,'REJECTED','');
            }
        
    },
    receiveAnswer : function(cmp, objString){
            const peerConnection = cmp.get('v.rtcObject');
            peerConnection.setRemoteDescription(JSON.parse(objString));
            console.log('answer received');
            cmp.set('v.sendICECandidateDirectly',true);
            if(cmp.get('v.iceCandidates').length>0){
                console.log('ice candidate sent');
                this.sendMessage(cmp,'ICECANDIDATE',JSON.stringify(cmp.get('v.iceCandidates')));
            }
    },
    receiveIceCandidate : function(cmp, objString){
        console.log('ice candidate received');
        const peerConnection = cmp.get('v.rtcObject');
        const candidateList=JSON.parse(objString);
        for(var i=0;i<candidateList.length;i++){
            peerConnection.addIceCandidate(new RTCIceCandidate(candidateList[i]), function(){}, 
                function(e) { console.log("Problem adding ice candidate: "+e);});
        } 
    },
    sendMessage : function(cmp,type,objString){
        var action = cmp.get("c.sendMessage");
        action.setParams({ senderId : cmp.get('v.senderId'),
                           type : type,
                           objectString : objString });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('Message sent :: '+ response.getReturnValue());
                //alert("Message Sent Status: " + response.getReturnValue());       
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                            if (errors[0] && errors[0].message) {
                                console.log("Error message: " +  errors[0].message);
                            }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        action.setBackground();
        $A.enqueueAction(action);

    }

})