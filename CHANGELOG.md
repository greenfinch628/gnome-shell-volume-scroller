# Changelog

## Unreleased

- Added optional sound feedback when scrolling changes volume. Feedback is enabled by default and uses the same sound event as the GNOME System Menu.
- Added **Enable Sound Feedback** and **Feedback Sound** preferences. The sound dropdown also offers Bell, Information, and Message from the system sound theme.
- Coalesced rapid scroll ticks and canceled previous feedback playback to avoid overlapping sounds.
