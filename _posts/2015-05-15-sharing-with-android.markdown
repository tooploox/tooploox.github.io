---
layout: post
title:  "Sharing content on Android - made simple"
date:   May 15, 2015
post-image: /images/posts/sharing-content-on-android---made-simple-header.png
author: damian-walczak
excerpt: I bet you had a moment, when you needed to share something from your app. And if you didn't, at some point of your adventure with Android development, you'll get to that point.

categories: android programming
---

### Intro

I bet you had a moment, when you needed to share something from your app. And if you didn't, at some point of your adventure with Android development, you'll get to that point.

There is bunch of rules, that one should keep in mind when sharing content, some of them are [described in Android training](http://developer.android.com/training/sharing/send.html), other in [Intent](http://developer.android.com/reference/android/content/Intent.html) class docs. 

The truth is, some apps out there, that follow [the contract](http://developer.android.com/reference/android/content/Intent.html#EXTRA_TEXT) introduced by Google, and there are [some](http://facebook.com/), that break it [with cold blood](https://developers.facebook.com/bugs/332619626816423).

Regardless of the reason, there are cases, where you'd like to filter out the apps, that will be displayed in share dialog. Or you'd like to write custom dialog. Anyway, you'd like to have some control over the sharing dialog behaviour.

If that's the case, you're in the right place! :)


### Show me the code!

Yep, you're here for code (as we all know, the Internet is for [code](https://www.youtube.com/watch?v=eWEjvCRPrCo), right? ;))

The most basic sharing intent code would look something like this:

```java
Intent sendIntent = new Intent(Intent.ACTION_SEND);
sendIntent.putExtra(Intent.EXTRA_SUBJECT, shareContentSubject);
sendIntent.putExtra(Intent.EXTRA_TEXT, shareContent);
sendIntent.setType("text/plain");
startActivity(Intent.createChooser(sendIntent, "Share with"));
```

Above code will show standard share dialog allowing user to pick the appropriate app.

What if you need to filter out the apps or share to a distinct application (that e.g. don't have the SDK like [Facebook](https://developers.facebook.com/docs/android) or [Twitter](https://dev.twitter.com/twitter-kit/android)).

Lets say we'd like to check if a given application is installed. There are cases, when you need this kind of information.

Having in mind, that Android has a very strict rule, that package name can't be changed for the application, makes it possible to map the application in question to the package.

To find package name for the app, it's enough to search it in Google Play on your browser.

![](/images/posts/sharing-content-on-android---made-simple-1.png)

Here we see, that package name for twitter is `com.twitter.android`.

Let's see the code, that will go through all installed apps on the device and check if given packages are avaliable. For further usage, we'll write it in a way, that it returns list of matching `ResolveInfo` objects.
 
```java
static Collection<ResolveInfo> findMatchingResolveInfo(PackageManager pm, Intent messageIntent, String... lookupPackages) {
    Collection<ResolveInfo> resInfo = findAllMatching(pm, messageIntent);
    Collection<ResolveInfo> matchingResInfo = new HashSet<>(resInfo.size());
    for (ResolveInfo resolveInfo : resInfo) {
        String packageName = resolveInfo.activityInfo.packageName;
        for (String lookupPackage : lookupPackages) {
            if (packageName.contains(lookupPackage)) {
                matchingResInfo.add(resolveInfo);
                break;
            }
        }
    }
    return matchingResInfo;
}
```

Having this, we can introduce a method to check if the listed packages are installed:

```java
static boolean isPackageInstalled(PackageManager pm, Intent messageIntent, String... lookupPackages) {
    return !findMatchingResolveInfo(pm, messageIntent, lookupPackages).isEmpty();
}
```

Methods are prepared in a way to pass several packages, as it's sometimes easier to use. So, we checked that our app is installed; how can we make it, so our `Intent` will be send to specific app?

There are two ways to do so. If we have only one target app, we should use [`Intent.setPackage`](http://developer.android.com/reference/android/content/Intent.html#setPackage(java.lang.String)). On the other hand, if you'd like to show a picker prioritizing given apps, you can use [`Intent.EXTRA_INITIAL_INTENTS`](http://developer.android.com/reference/android/content/Intent.html#EXTRA_INITIAL_INTENTS).

Having in mind the previous method implementented, we can do it like that:

```java
static Intent filterSendAction(PackageManager pm, Intent messageIntent, String... lookupPackages) {
    Collection<ResolveInfo> matchingResInfo = findMatchingResolveInfo(pm, messageIntent, lookupPackages);

    if (!matchingResInfo.isEmpty()) {
        if (matchingResInfo.size() == 1) {
            messageIntent.setPackage(matchingResInfo.iterator().next().activityInfo.packageName);
        } else {
            List<LabeledIntent> intentList = new ArrayList<>();
            for (ResolveInfo resolveInfo : matchingResInfo) {
                Intent intent = new Intent(messageIntent);
                ActivityInfo activityInfo = resolveInfo.activityInfo;
                intent.setComponent(new ComponentName(activityInfo.packageName, activityInfo.name));
                intentList.add(new LabeledIntent(intent, activityInfo.packageName, resolveInfo.loadLabel(pm), resolveInfo.icon));
            }
            LabeledIntent[] extraIntents = intentList.toArray(new LabeledIntent[intentList.size()]);
            messageIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, extraIntents);
        }
    }
    return messageIntent;
}
```

### What's next?

Those are the basics of how you can customize your sharing functionality.
Using the code from `findMatchingResolveInfo` with [`Intent.setPackage`](http://developer.android.com/reference/android/content/Intent.html#setPackage(java.lang.String)) method you can write a completely custom share view.

For more info please check our [github sample project](https://github.com/tooploox/share-android-sample), containing really simple custom share view. That's it for now.
Feel free to contact me if you find the post useful or you have some feedback regarding the content (especially if you find a bug in my sample project ;))

