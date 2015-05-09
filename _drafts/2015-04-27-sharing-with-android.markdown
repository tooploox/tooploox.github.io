---
layout: post
title:  "Sharing content on Android - made simple"
date:   April 27, 2015
post-image: /images/posts/android-sharing.png
author: damian-walczak
categories: android programming
---

### Intro

I bet you had a moment, when you needed to share something from your app. And if you didn't, at some point of your adventure with app development for Android, you'll get to that point.

There is bunch of rules, that one should keep in mind when sharing content, some of them are [described in Android training](http://developer.android.com/training/sharing/send.html), other in [Intent](http://developer.android.com/reference/android/content/Intent.html) class docs. 

The truth is, there are some of the apps out there, that follow [the contract](http://developer.android.com/reference/android/content/Intent.html#EXTRA_TEXT) introduced by Google, and there are [some](http://facebook.com/), that break it [with cold blood](https://developers.facebook.com/bugs/332619626816423).

Regardless of reason, there are cases, where you'd like to filter out the apps, that will be displayed in share dialog. Or you'd like to write custom dialog. Anyway, you'd like to have some control over the sharing dialog behaviour.

If that's the case, you're in correct place! :)


### Show me the code!

Yep, you're here for code (as we all know, the Internet is for [code](https://www.youtube.com/watch?v=eWEjvCRPrCo), right? ;))

 
```java
private static Collection<ResolveInfo> findMatchingResolveInfo(
                        PackageManager pm, 
                        Intent messageIntent, 
                        String... lookupPackages) {
    List<ResolveInfo> resInfo = pm.queryIntentActivities(messageIntent, 0);
    Collection<ResolveInfo> matchingResInfo = new HashSet<>(resInfo.size());
    for (int i = 0; i < resInfo.size(); i++) {
        ResolveInfo ri = resInfo.get(i);
        String packageName = ri.activityInfo.packageName;
        for (String lookupPackage : lookupPackages) {
            if (packageName.contains(lookupPackage)) {
                matchingResInfo.add(ri);
                break;
            }
        }
    }
    return matchingResInfo;
}
```
