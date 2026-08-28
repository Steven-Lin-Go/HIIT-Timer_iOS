import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

// Picking and storing the user's custom timer backdrop.
//
// The picker hands back a URI in a cache location the OS is free to purge, so
// the chosen image is copied into the document directory under a fresh name.
// The filename is timestamped rather than fixed because Image caches by URI --
// reusing one path would leave the old bitmap on screen after a change.

const DIR_NAME = 'backgrounds';

const backgroundDir = (): Directory => {
  const dir = new Directory(Paths.document, DIR_NAME);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
};

export type PickResult =
  | { status: 'saved'; uri: string }
  | { status: 'canceled' }
  | { status: 'denied' }
  | { status: 'failed'; error: unknown };

/**
 * Prompts for library access, opens the picker, and copies the chosen image
 * into app storage. Returns the persisted file:// URI.
 */
export async function pickBackground(): Promise<PickResult> {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return { status: 'denied' };
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      // Portrait crop matching the phone screen, so the image is not stretched.
      aspect: [9, 19.5],
      quality: 0.85,
    });
    const asset = picked.canceled ? undefined : picked.assets?.[0];
    if (!asset) {
      return { status: 'canceled' };
    }

    const source = new File(asset.uri);
    const extension = source.extension || '.jpg';
    const destination = new File(backgroundDir(), `bg-${Date.now()}${extension}`);
    await source.copy(destination);
    return { status: 'saved', uri: destination.uri };
  } catch (error) {
    return { status: 'failed', error };
  }
}

/** Removes a previously stored backdrop. Safe to call with a stale URI. */
export function deleteBackground(uri: string | null): void {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // A missing or already-deleted file is not worth surfacing to the user.
  }
}
