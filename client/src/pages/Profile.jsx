function Profile() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20">
      <p className="ui-label text-sm uppercase tracking-[0.2em] text-yellow">Profile</p>
      <h1 className="mt-4 text-4xl font-black text-cream md:text-6xl">Preferences and display</h1>
      <div className="surface-panel mt-10 grid gap-5 p-6">
        <label className="grid gap-2 text-sm font-semibold text-muted" htmlFor="favoriteFandoms">
          Favorite fandoms
          <input id="favoriteFandoms" placeholder="Anime, Gaming, Comics" type="text" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-muted" htmlFor="display">
          Display preferences
          <select id="display">
            <option>Dark Fandom Pulse</option>
            <option>Light Fandom Pulse</option>
          </select>
        </label>
      </div>
    </section>
  )
}

export default Profile
