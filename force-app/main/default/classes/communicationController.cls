public with sharing class communicationController {
    
    @AuraEnabled
    public static string sendMessage(String senderId, String type, String objectString) {
        ConnectionMessage__e msg=new ConnectionMessage__e(Object__c=objectString,
                                                          SenderId__c=senderId,
                                                          Type__c=type
                                                        );
        Database.SaveResult sr = EventBus.publish(msg);
        if (sr.isSuccess()) {
            return('SUCCESS');
        }
        return('FAILURE');
    }
}
