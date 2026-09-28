function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-5 transition hover:border-primary/40">
      <h3 className="font-orbitron text-xs font-bold uppercase tracking-[0.2em] text-yellow">
        {title}
      </h3>
      <div className="mt-3 text-sm leading-7 text-cream/90">{children}</div>
    </div>
  )
}

function Field({ label, value }) {
  if (!value) return null
  return (
    <div className="min-w-0">
      <p className="text-[0.7rem] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 truncate text-sm text-cream">{value}</p>
    </div>
  )
}

export default function MovieDetails({ media }) {
  if (!media) return null

  const hasAnything =
    media.synopsis ||
    media.director ||
    media.writers?.length ||
    media.producers?.length ||
    media.studios?.length ||
    media.distributor ||
    media.runtimeMinutes ||
    media.genres?.length ||
    media.languages?.length ||
    media.country ||
    media.budgetUsd ||
    media.boxOfficeUsd ||
    media.releaseDate ||
    media.filmingStartDate ||
    media.awards?.length ||
    media.trivia?.length ||
    media.soundtrack?.length ||
    media.galleryUrls?.length

  if (!hasAnything) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted">
        Detailed information for this media has not been added yet.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {media.synopsis && (
        <Card title="Synopsis">
          <p className="leading-7">{media.synopsis}</p>
        </Card>
      )}

      <Card title="Details">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Field
            label="Release"
            value={
              media.releaseDate
                ? new Date(media.releaseDate).toLocaleDateString()
                : media.releaseYear
            }
          />
          <Field
            label="Runtime"
            value={media.runtimeMinutes ? `${media.runtimeMinutes} min` : null}
          />
          <Field label="Country" value={media.country} />
          <Field label="Director" value={media.director} />
          <Field label="Distributor" value={media.distributor} />
          <Field
            label="Budget"
            value={
              media.budgetUsd ? `$${media.budgetUsd.toLocaleString()}` : null
            }
          />
          <Field
            label="Box Office"
            value={
              media.boxOfficeUsd
                ? `$${media.boxOfficeUsd.toLocaleString()}`
                : null
            }
          />
        </dl>

        {(media.genres?.length ||
          media.languages?.length ||
          media.writers?.length ||
          media.producers?.length ||
          media.studios?.length) && (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {media.genres?.length > 0 && (
              <div>
                <p className="text-[0.7rem] uppercase tracking-wider text-muted">
                  Genres
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {media.genres.map((g) => (
                    <span
                      className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-cream"
                      key={g}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {media.languages?.length > 0 && (
              <div>
                <p className="text-[0.7rem] uppercase tracking-wider text-muted">
                  Languages
                </p>
                <p className="mt-2 text-sm text-cream">
                  {media.languages.join(', ')}
                </p>
              </div>
            )}

            {media.writers?.length > 0 && (
              <div>
                <p className="text-[0.7rem] uppercase tracking-wider text-muted">
                  Writers
                </p>
                <p className="mt-2 text-sm text-cream">
                  {media.writers.join(', ')}
                </p>
              </div>
            )}

            {media.producers?.length > 0 && (
              <div>
                <p className="text-[0.7rem] uppercase tracking-wider text-muted">
                  Producers
                </p>
                <p className="mt-2 text-sm text-cream">
                  {media.producers.join(', ')}
                </p>
              </div>
            )}

            {media.studios?.length > 0 && (
              <div>
                <p className="text-[0.7rem] uppercase tracking-wider text-muted">
                  Studios
                </p>
                <p className="mt-2 text-sm text-cream">
                  {media.studios.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {(media.filmingStartDate || media.filmingEndDate) && (
        <Card title="Filming Timeline">
          <dl className="grid grid-cols-2 gap-4">
            <Field
              label="Started"
              value={
                media.filmingStartDate
                  ? new Date(media.filmingStartDate).toLocaleDateString()
                  : null
              }
            />
            <Field
              label="Ended"
              value={
                media.filmingEndDate
                  ? new Date(media.filmingEndDate).toLocaleDateString()
                  : null
              }
            />
          </dl>
        </Card>
      )}

      {media.awards?.length > 0 && (
        <Card title="Awards & Achievements">
          <ul className="list-inside list-disc space-y-1">
            {media.awards.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </Card>
      )}

      {media.trivia?.length > 0 && (
        <Card title="Trivia">
          <ul className="list-inside list-disc space-y-1">
            {media.trivia.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </Card>
      )}

      {media.soundtrack?.length > 0 && (
        <Card title="Soundtrack">
          <ul className="list-inside list-disc space-y-1">
            {media.soundtrack.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </Card>
      )}

      {media.galleryUrls?.length > 0 && (
        <Card title="Behind the Scenes">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {media.galleryUrls.map((url, i) => (
              <a
                className="aspect-video overflow-hidden rounded-lg border border-border transition hover:border-primary/60"
                href={url}
                key={i}
                rel="noreferrer"
                target="_blank"
              >
                <img
                  alt={`Gallery ${i + 1}`}
                  className="h-full w-full object-cover transition hover:scale-105"
                  loading="lazy"
                  src={url}
                />
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}