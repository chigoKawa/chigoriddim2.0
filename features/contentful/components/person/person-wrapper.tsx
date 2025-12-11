"use client";

import React from "react";
import { IPerson } from "../../type";
import InlinePerson from "./inline-person";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { extractContentfulAssetUrl } from "@/lib/utils";
import { useContentfulInspectorMode } from "@contentful/live-preview/react";

// This component is responsible for rendering a person entry based on certain conditions.
const PersonWrapper: React.FC<IPerson> = (entry) => {
  const inspectorProps = useContentfulInspectorMode({
    entryId: entry?.sys?.id,
  });

  // Construct the full name by combining first and last names from the fields
  const firstName = entry?.fields?.firstName || "";
  const lastName = entry?.fields?.lastName || "";
  const name = `${firstName} ${lastName}`.trim();

  // Get the bio text or fallback to an empty string if no bio is provided
  const bio = entry?.fields?.bio || "";

  // Extract avatar URL
  const avatarUrl = extractContentfulAssetUrl(entry?.fields?.avatar || null);

  // If the person has a website, use it; otherwise, fallback to the root '/'
  const website = entry?.fields?.website?.fields?.url || "/";

  // Social links
  const twitterUrl = entry?.fields?.twitterProfileUrl?.fields?.url;
  const linkedinUrl = entry?.fields?.linkedinProfileUrl?.fields?.url;

  // If the person is marked as inline, we render the InlinePerson component
  if (entry?.isInline) {
    return <InlinePerson name={name} website={website} />;
  }

  // Full person card with avatar and live preview tagging
  return (
    <div
      className="flex items-start gap-4 p-4 shadow-md rounded-lg bg-card border"
      data-contentful-entry-id={entry?.sys?.id}
      data-contentful-field-id="internalTitle"
    >
      {avatarUrl && (
        <div {...inspectorProps({ fieldId: "avatar" })}>
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={`https:${avatarUrl}`}
              alt={name || "Person avatar"}
            />
            <AvatarFallback>
              {firstName?.charAt(0)}
              {lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      <div className="flex-1">
        <p
          className="font-bold text-lg"
          {...inspectorProps({ fieldId: "firstName" })}
        >
          {name}
        </p>

        {bio && (
          <div
            className="text-sm text-muted-foreground mt-1"
            {...inspectorProps({ fieldId: "bio" })}
          >
            {bio}
          </div>
        )}

        {(twitterUrl || linkedinUrl || website !== "/") && (
          <div className="flex gap-3 mt-2 text-sm">
            {website !== "/" && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                {...inspectorProps({ fieldId: "website" })}
              >
                Website
              </a>
            )}
            {twitterUrl && (
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                {...inspectorProps({ fieldId: "twitterProfileUrl" })}
              >
                Twitter
              </a>
            )}
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                {...inspectorProps({ fieldId: "linkedinProfileUrl" })}
              >
                LinkedIn
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonWrapper;
