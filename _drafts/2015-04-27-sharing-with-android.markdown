---
layout: post
title:  "Sharing content on Android - made simple"
date:   April 27, 2015
post-image: /images/posts/club-mate.png
author: damian-walczak
categories: android programming
---
Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
laboris nisi ut aliquip ex ea commodo consequat.
 
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

Duis aute irure dolor in reprehenderit in
voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
non proident, sunt in culpa. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
eiusmod tempor incididunt ut labore et dolore magna aliqua. 
