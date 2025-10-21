'use client'

import BioInput from '@/components/profile-edit/bio-input'
import ProfileImgEdit from '@/components/profile-edit/profile-img-edit'
import SaveButton from '@/components/profile-edit/save-button'
import UsernameInput from '@/components/profile-edit/username-input'
import useProfileEdit from '@/hooks/profile/use-profile-edit'

export default function ProfileEditClient() {
  const {
    username,
    bio,
    imageUrl,
    loading,
    setUsername,
    setBio,
    handleImageChange,
    handleSave,
  } = useProfileEdit()

  return (
    <form
      className="flex flex-col justify-center items-center p-4 w-full gap-5"
      onSubmit={e => {
        e.preventDefault()
        handleSave()
      }}
    >
      <ProfileImgEdit imageUrl={imageUrl} onChangeImage={handleImageChange} />
      <UsernameInput value={username} onChange={setUsername} />
      <BioInput value={bio} onChange={setBio} />
      <SaveButton type="submit" loading={loading} />
    </form>
  )
}
