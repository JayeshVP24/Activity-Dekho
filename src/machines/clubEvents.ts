import { createMachine, assign, sendParent } from "xstate";



const ClubAddEventMachine = 
/** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AghBGplrhAJawA2AhgJ4UZQByYA7idgGID2ATgFsAxAGUAqgCEAsgEkAKgG0ADAF1EoAA69YFLBV4YNIAB6IAbAEZLuAKwAWAMwAmR8oCczywHZzADncAGhB6REtzZ1w-H29bWz9HK3NvBIBfVOCuHAIiLNxaIiYoLPleABFJYQhDMFwmVF4Aa1qsvEJidGx8wuYS8skEet4AY1p9QxVVSeNtXXGjJFMw73tcS0dvdz9nP1tPe3dPYNCESz9vXHtw2y8A3fsd+3TMzuz2vILKXtfSiuEwfj8AS4TR0LAAMwEglwrRyHVI3S+xR+-UGGAao3mk2mi1megMC1AZgQD1sUSsbnsK3M7mS3mOiHOuEctnM9j87KptkcW0czxAsNkZQAMshhABhAASyHFAGkAPr4cTySU4rQ6fGGYzEgC09nM5mZ5mUzhS3nWB28ylsDIQm1w5o8+tibls3kcTwyAteeCFool0rliuVqss6lxGvm2sQOtikUszh2tPcjj8fjZzltlm5l1Z9geCU8-mt-NhACUwFh+GBUEVWlUanV0U1atWqxQa2BhtQAK4AI072FgapAeKji11Pki7Pd5jd8QSHhtITCibsETTm3W5hZJtLPtwFarNbrPv+gOBoLGkKEuDb-A76G7-cHOBHY4J0YQOtsylW3m8U0HBpRxwi8exbQ9GxbEsP8NkOaIDXMfdSDwShYCvRhegvfhhDLZB5DLABNd9I0-CcY3NMk2X2Q4dzTcxIN-B1XHcZRrWcGkOWzFCh3IKhMNPVDhHwMoynlZAADVkBYJQ1BmMitQohAvAuRNlF8a0NnsGC-0g2JcGtB4vFpSx7GtPxeOyI9q1rb5hOqDBaiGZo70rB9O2fAcfUUMMFLmciiRjZw-0uBCrWsNxdkzFcEA2ZlCzYjxtgTUD0i9DBeAgOBjFafzNUJJZv22C4zicTZnAOHZ1ltHVwkNM4fGUM5QPzCqrLaXJXn4mgGCKNhOFePghHy8cgpJeI1msN0EkcObmuXE5rDWFwaQeOdeT8ZqOrhD4emRUhfkkUbAqKs4LjdODmvcHwd38W1DWiRd02iR5jWQr1BRFZATqU8a9SsKIQoSNMUx3U0sxsXY3UanxzjZFYdpsk97KHX7Ct1GDViMk1ooXKxbVcSJmrg5N9RunaAHFeCKUpJV4QQwAABVoGB0a-WN7TK+DKs8aJHFqmwPS8RNtjmy1zOcHb0ME1GcHZ5SdUBhwvHYjlDmsd7ILOXBE0sNjWV-DT-GlgS6Cw4ocIV-6HFWcI4Ng7NQJWW0rkid13El9i7vWHb3lea2zp5OwrSca7bsSPxavtfxwnOFIHn1gIds+fAsCwTAIFoDBhjAQPdUTC5lCsAIE3cFZy6cV2dwdNkrBTKkrgNdLUiAA */

/** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AghBGplrhAJawA2AhgJ4UZQByYA7idgGID2ATgFsAxAGUAqgCEAsgEkAKgG0ADAF1EoAA69YFLBV4YNIAB6IAbAEZLuAKwAWAMwAmR8oCczywHZzADncAGhB6REtzZ1w-H29bWz9HK3NvBIBfVOCuHAIiLNxaIiYoLPleABFJYQhDMFwmVF4Aa1qsvEJidGx8wuYS8skEet4AY1p9QxVVSeNtXXGjJFMw73tcS0dvdz9nP1tPe3dPYNCESz9vXHtw2y8A3fsd+3TMzuz2vILKXtfSiuEwfj8AS4TR0LAAMwEglwrRyHVI3S+xR+-UGGAao3mk2mi1megMC1AZgQD1sUSsbnsK3M7mS3mOiHOuEctnM9j87KptkcW0czxAsNkZQAMshhABhAASyHFAGkAPr4cTySU4rQ6fGGYzEgC09nM5mZ5mUzhS3nWB28ylsDIQm1w5o8+tibls3kcTwyAteeCFool0rliuVqss6lxGvm2sQOtikUszh2tPcjj8fjZzltlm5l1Z9geCU8-mt-NhACUwFh+GBUEVWlUanV0U1atWqxQa2BhtQAK4AI072FgapAeKji11Pki7Pd5jd8QSHhtITCibsETTm3W5hZJtLPtwFarNbrPv+gOBoLGkKEuDb-A76G7-cHOBHY4J0YQOtsylW3m8U0HBpRxwi8exbQ9GxbEsP8NkOaIDXMfdSDwShYCvRhegvfhhDLZB5DLABNd9I0-CcY3NMk2X2Q4dzTcxIN-B1XHcZRrWcGkOWzFCh3IKhMNPVDhHwMoynlZAADVkBYJQ1BmMitQohAvAuRNlF8a0NnsGC-0g2JcGtB4vFpSx7GtPxeOyI9q1rb5hOqDBaiGZo70rB9O2fAcfUUMMFLmciiRjZw-0uBCrWsNxdkzFcEA2ZlCzYjxtgTUCrLQgS6Cw5FhNE8T8HkeQZLKfAWHFZBSICpSgu-VxVg02lzWcPYeTzSC-GUZkU3zXwDmzDx0sRfAsCwTAIFoDBhlqdDMOkXhxuoYRxAABWFAB5USJIADXK4VKs1QkllOBIonYjqdmcTwGpik42TJDZE3OjTEl2QbPmG0aMHGybanQB9wQobLkBMKbFsc5zm1cv6KHBegwBBsBqH28cat-Trs3CAJdzYt1bXddxcC8U1XA8dx9Uut6iA+saJqm3BoYBoGEcWgEgX4EEwRvaEGbh5nkcCo6tlzcIDTMlZ9R0vGeUJhNALcQ5yfcdIvQwea4GMVp-IOr8dW2C4zicTZnAOHZ1ltHURbWaIIoSMyqU8Qb3lefiaAYIo2E4V4+CELWUaOnS-DWaw3QSRww+UbMsxsdZOLJzi9gSDrLEd3Jnc+ITsF+SRfYF4kzguN04Ij9wfB3fxbUNaJF3TaJHmNZCvUFEVkBz6qjr1KwohCxOsZ3U0o6iOJzWiHxzjZFZBpsk97KHVvDt1GD6ocE1ooXKxbVcSII7g5N9RLwaAHFeCKUpJV4QQwGW2gYDnnWAIJg34ONzxokcc2bA9ImLrDy1zOcQaZpZQzjgW+ykdSdwcF4M6BwS7hGUIxWKoFA6JksDjOc7FfCWUbgeQBbtsJs1ATVH8+Y1jGicLBbMoEVi2iuJEfGf92Jl3WCneE2BCFHXWATQuThi6lxeube0-hMYAQ5CZAIlMIDUy+rTMA7DdQpjsOyMOqYbhxBZMuE4BxDQPVNGLbiE9sGoSGiNGmP0XazXmrQagciwgGjsC4P8c4bjbASDdRA8RIjnEeobc4ZxbASKkd9OmDNAZ1mZjYlSZxhZITFvmO6eMzKXAiO6dYdtzJK0MXxd6JjpFmKcuwAABLALAYwwAFMsBEiI6MYL+BTL+HG9JYrukcDLYm8syYRAyS8Ix2TPpBNqPkopJTRoFOcBEvUZIHChxUc1bkcQIJNLDq0uWpNFbK1SEAA */

/** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AghBGplrhAJawA2AhgJ4UZQBiA9gE4C2AxAMoBVAEIBZAJIAVANoAGALqJQABzawKWCmwyKQAD0QBWAMwBOXADYAHAEZrRgwcsmZtgwBoQ9RACYZ33EYALNaWlvYmAOzeEUYAvrEeJNh4hMTo2Li0RExQSVgSbAAiQjwQWmC4TKhsANYVWRBg6VhYRUKyCkggKmoaWjr6CNYRgbh2ESaW3pYGJt6BJnMeXkOWEbjB5gbeIZMGgdOB8YnNKUR5mdnMeQXFPGAcHJy4SnRYAGacXJeNza3FHR0PXUmm0XUGgQMMgCRksLhM1hMRiiSMCy0QyICJkCgVMlkC5giBlsxxAeTwYkKABlkDwAMIACWQdIA0gB9fACCQMwFdYF9MGgQYAWgJ5gC5j8ETWdgWERk7k8iAmuAi1hk2MJxgVMSOCTJp1wlJp9KZrI5XJ51k6ylUIP64MQwqJ-ms3mmJnMSNC5gO6KGxg2Bl9BzCcysCtJ5NwACUwFgOE0cuTSuVKhhqnVcImExQmmAAMbUACuACN88lebbeqCBk7hv5AmsjFsiaEjBrFSs3f5g9M1giW-Y-FHDXGE0nrqd7o9nq9aB8vtn4xw8+gi2WKzgq907QK6whhVDRhEokSCUjrOYdmilQggtZcMSZLiJpMr+ZzKPSHhKLB54w1yzhwPAxsgEgxgAmju-K1o6h5qgYFgLPMizmLCljmP6w6qt4pgyAq3hevi1gGN+yTkFQAHJtO+CFIUbLIAAasgABy0jyECe5wUKPjDLg7oyBEkrGCMz63isyJIQqBw7J61iBAqljkTgsYrpOuTTmUGAVFUtQVDmq75hu5anFI1pcTWDq8YevijAskzyrYHYzN42HrLCpjOBqUxukY1gqb+VF0IBmk-jwdEMfgEgSGxhT4KxdLIDB3HWXo9ZBKqJGkdeBEhHY-qBDEuAvrML5ODsthbIFPz4C0mAQLQGAFhUf7UcwIhsI11A8AIAAKVIAPJ0YxAAaSVUilVmCulCA4khJiOH4YbImqbl3gYwlPn4wQ4uY6rXt4NUNHVWANU1LW4Ogq7vBQoXILoLU9dpukZvpV0PBQ7z0GAj1gNQU32jNEKSgEiH7DIVg+iY-pOI+3jEp6vqzOhOLHUQp3nc1FTXV9d3Jn9PUPE8HAvG8nzcB9N0-YTgP7vBOyWLh2wapMiw2J+-qEo+MSwpD9j+UEZH6tGJ31RgjXYz8OSYxLF1gLcJQvemmb1EQC5nXL2P-O0nF8qlwOIDi6zSnMzi4g+7pdogth+AJcxKbYviIvE+oYF1cA6OSllAwewpTOsISvnMKE2EY-rCjsHmeopRUyKYITKSLhqpBcf4hTk7DcD79M2Qs4oKaEYTEmE6pEhHOJYuhWzGL4QTunqJw-gQ5zNNLU6kIrOc8bNtiPqEwzIpDtsIxJypjPtQn7E46FXgsNXGsg3dpSKBL974YShEi6HRP6ti4DMm35cMay+iMNXjomqA0T+y+G4exKjDJy3bI4mHWP6eH+C4L6mF6F4BWTs3AA4mwHIBQGRsC4GAPqtAYB3z9qeMwQdkQhzmGHCOj5649imEYIIkRFJHSARRNqGcO7JAQfBYU+0nwHHVDIfEiwqqQ2wiEASckFRbAIsJJOTcSHBQYMmYClCbJHkrleX+6pSL+RGIVN0qpTCEIItXOwNVU7NBEbNdCB8bAxHlPtdUo9MEdgPp6ZEUwbDBDhI3A0zcxaa0li1TRgxSIeShNsAOdg0Jj3vIsEqkonAIj8C4ewNjRYY3Fo41qAjQqdW6s4jEKo1REiCAsBwVjCozCfJKZw149qx3RhAWWUSqZ43uoTBJc0rBjHjh+Yeix-TCWhN4QcIRpQxHxGEw09isaXQaDLSJ8su762mgeFsoxtiElCAjFwoQIj+kWmYKI9gRibxfJ+QpxT5a4B0gAdwAASwCwAuMA+zrCVN8EhYcHjoheJjnvWp213HbDwYXL8rsgA */

/** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AghBGplrhAJawA2AhgJ4UZQBiA9gE4C2AxAMoBVAEIBZAJIAVANoAGALqJQABzawKWCmwyKQAD0QBWAMwBOXADYAHAEZrRgwcsmZtgwBoQ9RACYZ33EYALNaWlvYmAOzeEUYAvrEeJNh4hMTo2Li0RExQSVgSbAAiQjwQWmC4TKhsANYVWRBg6VhYRUKyCkggKmoaWjr6CNYRgbh2ESaW3pYGJt6BJnMeXkOWEbjB5gbeIZMGgdOB8YnNKUR5mdnMeQXFPGAcHJy4SnRYAGacXJeNza3FHR0PXUmm0XUGgQMMgCRksLhM1hMRiiSMCy0QyICJkCgVMlkC5giBlsxxAeTwYkKABlkDwAMIACWQdIA0gB9fACCQMwFdYF9MGgQYAWgJ5gC5j8ETWdgWERk7k8iAmuAi1hk2MJxgVMSOCTJp1wlJp9KZrI5XJ51k6ylUIP64MQwqJ-ms3mmJnMSNC5gO6KGxg2Bl9BzCcysCtJ5NwACUwFgOE0cuTSuVKhhqnVcImExQmmAAMbUACuACN88lebbeqCBk7hv5AmsjFsiaEjBrFSs3f5g9M1giW-Y-FHDXGE0nrqd7o9nq9aB8vtn4xw8+gi2WKzgq907QK6whhVDRhEokSCUjrOYdmilQggtZcMSZLiJpMr+ZzKPSHhKLB54w1yzhwPAxsgEgxgAmju-K1o6h5qgYFgLPMizmLCljmP6w6qt4pgyAq3hevi1gGN+yTkFQAHJtO+CFIUbLIAAasgABy0jyECe5wUKPgHGM+ybJhUL7AYETYSYSGEt4ULqsJMRGHE+rRuOiaoDRP6phgFRVLUFQ5qu+YbuWpxSNaXE1g6vGHr4owLJM8q2B2MzeNh6ywqYzgalMbpGNY5E4JR-50IBuS0fRHISBIbGFPgrF0sgMHcVZej1kEqokaR14ESEdj+oEMS4C+swvk4Oy2FsAV4A0+AtJgEC0BgBYVH+1HMCIbANdQPACAAClSADydGMQAGglVJJZZgqpQgOJmBMnnzAqzkmP6jmqnJ0QdpJkKWFVPy1Vg9WNc1uDoKu7wUKFyC6M13VlNp6aZhU50UO89BgLdYDUJN9rTRCvq4L4RIhDIcIHAV-oORYHZES+OKIop+01XVGANU1L0PG9V3Jl93UPE8HAvG8nzcGdWPvZ9d2-fu8Hur25i2CMOXEtiXbKlYYxuuqMiKREXpGN4yNEIdx0Yz8OSi2jJ1gLcJQPTpGZ6T8C5HdLGP-O0nF8sl-2IIi0J+Qc7rDJC+ykVDvi4JMCpaozgtzMLEBS+jp0NJLqOu7LbQzoTxMLqT3wNKrYvNZrNM8TNkpmISLg2AROIif6jONsGHb85EYQyBE8T6hgnVwDo5IWX9B7ClM6whK+cwoTYRj+sKOzuZ6yLzPz1iBC4SknD+BDnM0QUhTk7DcCXtPWQs4od6EYTEmE6pEg3OJYuhWzGL4QTunqPcUakFzu1OpBy2PkeDLYj6hMMyIyIz6oybeKyV4z2f7E46FXgs+3GsgJ8pSKBIX18GEUISJ0LRH9LYXAMwxK5WGGsX0Ix9qqUnGFH8v89aHmJKMBUndpjbEcJhaw-o8L+BcC+UwXoLz+WUoaAA4mwHIBQGRsC4GAXqtAYDoLLqeMwVdkQ1zmHXBuj5N49imIpOUuD9qtSHofZIXD4LClsNCXBODVEEmmNhPCUDGYOCCJCDuncc40N7jIhgyZgIKOskeZeV5yHqlIn5EY+U3SqlMKom+LY7D7T3s0KxUcjBQJsDEeUt8-D7GER2KBLdpTTA7qDbeBpe4ozVl7fxZ8RhPlvszFwrNIT5UkhsUwiJ14kPsE7F2MsgptSgB1Lq6SMRhCfMYBYMxs7Z09P6Rwj4kRzAIu6BEiwhYmIoik0OmMLo42uHjBps01TW2KR2bO9hoiWH9DMcUn5PRulPIiXE1Cd6BTGerN2VwoCVIxsfHWU0DwtksBKaI2wiINi2BA22Yw45WCmHDfYudYhAA */

/** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AghBGplrhAJawA2AhgJ4UZQBiA9gE4C2AxAMoBVAEIBZAJIAVANoAGALqJQABzawKWCmwyKQAD0QBWAMwBOXADYAHAEZrRgwcsmZtgwBoQ9RACYZ33EYALNaWlvYmAOzeEUYAvrEeJNh4hMTo2Li0RExQSVgSbAAiQjwQWmC4TKhsANYVWRBg6VhYRUKyCkggKmoaWjr6CNYRgbh2ESaW3pYGJt6BJnMeXkOWEbjB5gbeIZMGgdOB8YnNKUR5mdnMeQXFPGAcHJy4SnRYAGacXJeNza3FHR0PXUmm0XUGgQMMgCRksLhM1hMRiiSMCy0QyICJkCgVMlkC5giBlsxxAeTwYkKABlkDwAMIACWQdIA0gB9fACCQMwFdYF9MGgQYAWgJ5gC5j8ETWdgWERk7k8iAmuAi1hk2MJxgVMSOCTJp1wlJp9KZrI5XJ51k6ylUIP64MQwqJ-ms3mmJnMSNC5gO6KGxg2Bl9BzCcysCtJ5NwACUwFgOE0cuTSuVKhhqnVcImExQmmAAMbUACuACN88lebbeqCBk7hv5AmsjFsiaEjBrFSs3f5g9M1giW-Y-FHDXGE0nrqd7o9nq9aB8vtn4xw8+gi2WKzgq907QK6whhVDRhEokSCUjrOYdmilQggtZcMSZLiJpMr+ZzKPSHhKLB54w1yzhwPAxsgEgxgAmju-K1o6h5qgYFgLPMizmLCljmP6w6qt4pgyAq3hevi1gGN+yTkFQAHJtO+CFIUbLIAAasgABy0jyECe5wUKGImEhaoNr4xKhFe-qBARYxBGE+IXiMZH6tG46JqgNE-qmGAVFUtQVDmq75hu5anFI1pcTWDq8YevijAskzyrYHYzN42HrLCpjOBqUxukY1jkTglH-nQgG5LR9EchIEhsYU+CsXSyAwdxFl6Igay4Aq1hNkYLbEi2fjiXhATzKRxiQphGpfophoNPgLSYBAtAYAWFR-tRzAiGw9XUDwAgAApUgA8nRjEABpxVSCXmYKyUIBJli4GhBinhlLgzMi-rSuKKEzBJEw4u6fl4NVtUYPVjUVOgq7vBQwXILoTVdWUmnppm50PBQ7z0GAd1gNQE32lNEIFcELh+DY2q2P66pRBsPZrDeMhOBEB0-DVWB1Q1TW4Bd73Xcm31dQ8TwcC8byfNwWNvR9X33X9+7wSEj4ROhbYxOh-FOP6Tm4E4wTRFDjj8cjR1oydGP1FcUCo+jZ23CUj1aRmOk-AuIunU1-ztJxfKJQDiCkesL5hMMbqfqe6H+u+uDRFC1mSpKxhC0QUui2dPw5M7atgLLM5EyTC5k98DQq9L6ttLTPHTcGc1w0zi2mEY0T+l66x4WEQQEqe0TIy1QVqckPBMWIyAAOrhZFrHRbF8Va9W-0HsKOxzc4IYHFE7m4uJ15pXhDgvvspHeApJw-ljeYAO7u8dnv0gNfDIGyhcl2XUUxXF4dJSKcpW2sYaep6xLYv6xiPvMCP2QqgTypY8T6hgHVwDo5JmXX8HClM6whK+cxbXY-oN8MWJ0I2EWNEAkvlKoj1SBcP8udmDsG4M-OmlkFjigyqEMIIkfIyCJH-HEgDsrGF8EEd0eph4USgc0N2U5SCy0QRHQYthHyiRiPKcwtg-D7HWmMNh2D9hOHQleBYyNjTIDoRvJ0YDua+Bkk4Icic7y2G5g4NUNhhhrF9CMZGylJwhR-GI3Wh5iSjAvqDbYjhMLWH9HhfwINcR7wvOAsh-kADibAcgFAZGwLgYAeq0BgPo+up4zCf2RN-OYNgjB-0fMQ2GeEgiRAkt4bOVFYG6OSAE1+pFxTeEWDINhBJjAIkhNhKEuF8KEWIsEIeBoR45wYMmYCGTLJHjwVeF8WDSI+RGOJN0qpTCJIIuhNhcQIHkPOM0Jp010LcxsCwvJ7DB63hWMKOw0J+HIimDYYIcJSE1IosLEOYBJkMKyqqZmjhWamAFkfOEVsdjul8HMHYkxHYQA9mLAKrUoDtU6scjEBxVTBgRgnYI-F7ZJ0-LhHsXpcn8WqdGA5LtMbYyujdfGfyZo+TGMENUTYEYSQOJEu82JHyQivFc7Z-TXnvNdg0Seqsxa0O1pNA8Cd1jBmMC2NCkocmQ2WjM2EcK5hQivMjVSYAJ7MBpU1DFwofJITdHMjs+xnAmCPp6MY8pgg4kcFsbBN9YhAA */

/** @xstate-layout N4IgpgJg5mDOIC5QFEBuYB2AXWA6AkgCIAyyAxAMIASyFA0gPoCCAqgCpUDaADALqKgADgHtYASyxjhGASAAeiALQAWAGyrcAZlXcATAHYAHPoCMm5QE593AKwAaEAE9E+i7lPcLa-Tc2395gC+gQ5omDgEJOTUtIysHJwm-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 */
createMachine({
    id:"Events",
    initial: "IDLE",
    states: {
        IDLE: {
            on: {
                CHECK_AUTH: [{
                    target: "RetrevingEvents",
                    actions: "checkAuthAndAddToContext",
                    cond: "isLoggedIn"
                }, "GoingToHomePage"]
            }
        },

        RetrevingEvents: {
            invoke: {
                src: "retrieveClubEvents",
                id: "retrieveclubevents",
                onDone: [{
                    target: "displayingEvents",
                    actions: "addEventsListToContext",
                    cond: "notEmpty"
                }, "AddEvent"],
                onError: {
                    target: "displayingError",
                    actions: "addErrorMsgToContext"
                }
            },

            entry: "clearErrorMsgFromContext"
        },

        GoingToHomePage: {
            entry: "goToHomePage",
            type: "final"
        },

        displayingEvents: {
            on: {
                ADD_EVENT: {
                    target: "AddEvent",
                    actions: "openAddEventModal"
                },

                ADD_ATTENDANCE: {
                    target: "addAttendance",
                    actions: ["addSelectedEventToContext", "openAddAttendanceModal"]
                },

                VIEW_ATTENDANCE: {
                    target: "viewingAttendance",
                    actions: ["openViewAttendanceModal", "addSelectedEventToContext"]
                }
            }
        },

        displayingError: {
            on: {
                RETRY: "RetrevingEvents"
            }
        },

        AddEvent: {
            states: {
                dislayingForm: {
                    on: {
                        SUBMIT: {
                            target: "addingEventToDB",
                            actions: ["addNewEventFormToContext", "clearErrorMsgFromContext"]
                        }
                    }
                },

                addingEventToDB: {
                    invoke: {
                        src: "addEventToDB",

                        onDone: {
                            target: "#Events.displayingEvents",
                            actions: ["alertNewEventAdded", "closeAddNewModal"]
                        },

                        onError: {
                            target: "dislayingForm",
                            actions: "addErrorMsgToContext"
                        },

                        id: "addeventtoDB"
                    }
                }
            },

            initial: "dislayingForm"
        },

        addAttendance: {
            states: {
                displayingModal: {
                    on: {
                        UPLOAD_EXCEL: {
                            target: "verifiyingExcel",
                            actions: ["addExcelToContext", "clearErrorMsgFromContext"]
                        }
                    }
                },

                verifiyingExcel: {
                    invoke: {
                        src: "verifyExcel",
                        id: "verifyexcel",
                        onDone: "addingAttendanceToDB",
                        onError: {
                            target: "displayingModal",
                            actions: "addErrorMsgToContext"
                        }
                    }
                },

                addingAttendanceToDB: {
                    invoke: {
                        src: "addAttendanceToDB",
                        id: "addattendancetoDB",

                        onError: {
                            target: "displayingModal",
                            actions: "addErrorMsgToContext"
                        },

                        onDone: {
                            target: "#Events.displayingEvents",
                            actions: ["alertAttendanceAdded", "closeAddAttendaceModal"]
                        }
                    }
                }
            },

            initial: "displayingModal"
        },

        viewingAttendance: {
            on: {
                CLOSE_VIEW_ATTENDANCE: {
                    target: "displayingEvents",
                    actions: "closeViewAttendanceModal"
                },

                ADD_ONE_ATTENDEE: "oneAttendeeForm",
                DELETE_ATTENDEE: "areYouSure"
            }
        },

        addingOneAttendee: {
            invoke: {
                src: "addOneAttendeeToDB",
                id: "addoneattendeetoDB",

                onDone: {
                    target: "viewingAttendance",
                    actions: "alertOneAttendeeAdded"
                },

                onError: {
                    target: "oneAttendeeForm",
                    actions: "addErrorMsgToContext"
                }
            }
        },

        oneAttendeeForm: {
            on: {
                SUBMIT: {
                    target: "addingOneAttendee",
                    actions: "clearErrorMsgFromContext"
                }
            }
        },

        deletingAttendee: {
            invoke: {
                src: "deleteAttendeeFromEvent",

                onDone: {
                    target: "viewingAttendance",
                    actions: "clearAttendeeIndexFromContext"
                },

                onError: {
                    target: "areYouSure",
                    actions: "addErrorMsgToContext"
                }
            }
        },

        areYouSure: {
            on: {
                YES: {
                    target: "deletingAttendee",
                    actions: ["addAttendeeIndexToContext", "clearErrorMsgFromContext"]
                },
                NO: {
                    target: "viewingAttendance",
                    actions: "clearAttendeeIndexFromContext"
                }
            }
        }
    },

})


export default ClubAddEventMachine

// export const ClubAddEventMachine = 
// /** @xstate-layout N4IgpgJg5mDOIC5QEMIQKIDcwDsAusAdAJYQA2YAxAMoAqAggEq0DaADALqKgAOA9rGJ5ifHNxAAPRGwA0IAJ7SAvkrmoM2fEQAWYMmT4B3PgCcyESvQAiVgProAaugBytQo3TUACgHlndryYXVk5xfkFhUXEpBABOABZCWIAOACYARgB2AGZ47IBWWLZ8rLlFBFTU-MIANnzi+PzknLrY7OSVVRAcPgg4cXUsXAIwgSERMSRJRABaKszCTNTm7NX45LT02LLZ5sJ6tkO2LPiazMz4zJU1NCGtEnIwUYiJ6MR0msTko-Tk7PSGjUNjsEAC2IRUj9KmxMmx-lVriBBpoCIQ+nhkMQyPApuFxlEpjEZul8ol8iV4sd0tTkvkMiDshl9ikailGjUCvkaojkcMdHoDMYzBBnvjJqAiZDYotljk1hsMtsFO9-oQYfFqdkaul-pluZ0gA */
// createMachine({
//     id: "addEvents",
//     preserveActionOrder: true,
//     predictableActionArguments: true,
//     initial: "idle",
//     tsTypes: {} as import("./clubAddEvent.typegen").Typegen0,
//     context: {
//         name: ""
//     },    
//     states: {
//         idle: {
//             on: {
//                 START: 'helloworld'
//             }
//         },
//         helloworld: {
//             on: {
//                 "ADD_EVENT.RESPOND_PARENT": {
//                     actions: sendParent("ADD_EVENT.DONE"),
//                     target: "responded"
//                 }
//             }
//         },
//         responded: {}
//     }
// })