---
layout: post
title:  "Data synchronization between iOS app and WatchKit extension"
date:   May 08, 2015
post-image: /images/posts/apple-watch-header.png
author: mateusz-nadolski
categories: swift iOS apple-watch
---

# Data synchronization between iOS app and WatchKit extension

### How does it work?

When you add a WatchKit app target to your existing project, Xcode creates 2 directories: WatchKit extension and WatchKit app. WatchKit extension runs on your iPhone, but in a separate sandbox than your iOS app though. WatchKit app contains only Storyboard and Resources. The data is synced between WatchKit app and WatchKit extension over Bluetooth Low Energy so it's a good practice to avoid sending big chunks of data between these two targets.

### How to synchronize your data?

There are several ways to send data between WatchKit extension and iOS app running on iPhone. After trying NSKeyedUnarchiver and NSUserDefaults I've come across a great open-source library called [MMWormhole](https://github.com/mutualmobile/MMWormhole) developed by folks at [MutualMobile](http://www.mutualmobile.com). It basically uses NSKeyedArchiver to write data to files which are written to the application's shared App Group. It also lets you register objects as listeners, so you get notified when new message is passed around.

### Let's try it in practice!

I've created a simple app called Contacts, which lets you browse, add and show details of contacts on the iPhone. Every time user enters the contact details view - corresponding contact details are displayed on the AppleWatch.

![](/images/posts/apple-watch-1.png) ![](/images/posts/apple-watch-2.png) ![](/images/posts/apple-watch-3.png)

Take into account that you have to be a member of Apple Developer program to run and test out the demo project in Xcode. Here's a short guide on how to [configure your app to support App Groups](https://developer.apple.com/library/ios/documentation/General/Conceptual/ExtensibilityPG/ExtensionScenarios.html).

So we simply want to send Contact object. Here's how Contact model looks like:

    final class Contact: NSObject {
    
        let firstName: String
        let lastName: String
        let phoneNumber: String
    
        init(firstName: String, lastName: String, phoneNumber: String) {
            self.firstName = firstName
            self.lastName = lastName
            self.phoneNumber = phoneNumber
        }
    }

Since MMWormhole uses NSKeyedArchiver for encoding objects and NSKeyedUnarchiver for decoding,
our Contact class must conform to NSCoding protocol thus we need to override these two methods:

    init(coder aDecoder: NSCoder) {
        firstName = aDecoder.decodeObjectForKey(firstNameKey) as! String
        lastName = aDecoder.decodeObjectForKey(lastNameKey) as! String
        phoneNumber = aDecoder.decodeObjectForKey(phoneNumberKey) as! String
    }
    
    func encodeWithCoder(aCoder: NSCoder) {
        aCoder.encodeObject(firstName, forKey: firstNameKey)
        aCoder.encodeObject(lastName, forKey: lastNameKey)
        aCoder.encodeObject(phoneNumber, forKey: phoneNumberKey)
    }

Also we need to specify unique keys used by a Contact object to encode or decode its instance variables.

To do so, we need to put this line of code before we try to send message through wormhole

    NSKeyedArchiver.setClassName("Contact", forClass: Contact.self)
    
and this one before we try to read message from wormhole
    
    NSKeyedUnarchiver.setClass(Contact.self, forClassName: "Contact")

Otherwise we'll receive the following error:

> [NSKeyedUnarchiver decodeObjectForKey:]: cannot decode object of class (Contacts.Contact)'

And that's it. Now we're ready to use MMWormhole to pass around our custom class objects.

I've created a WatchKitDataManager class responsible of sending and reading messages between iOS app and WatchKit extension.

    class WatchKitDataManager: NSObject {
        
        let contactClassName = "contact"

        let wormhole = MMWormhole(applicationGroupIdentifier: "group.tooploox.com.Contacts", optionalDirectory: nil)
    
        func sendContact(contact: Contact) {
            NSKeyedArchiver.setClassName(contactClassName, forClass: Contact.self)
            wormhole.passMessageObject(contact, identifier:contactClassName)
        }
    
        func readContact() -> Contact? {
            NSKeyedUnarchiver.setClass(Contact.self, forClassName: contactClassName)
            if let contact = wormhole.messageWithIdentifier(contactClassName) as? Contact {
                return contact
            }
            return nil
        }
    }

It's that easy!

Another great feature of MMWormhole library is ability to register object as listeners for new messages so we can very easily update our UI. Here's how to do this:

    wormhole.listenForMessageWithIdentifier(contactClassName) { (message) in
        if let contact = message as? Contact {
            self.delegate?.watchKitDataManagerDidUpdateContact(self, contact: contact)
        }
    }

And now when we run our iOS and WatchKit apps simultaneously we'll be able to see that contact details on Apple Watch are updated each time user enters contact details view on corresponding iOS app.

If you have any questions feel free to drop a comment below. You can view the [source code on Github here](https://github.com/tooploox/apple-watch-communication-example)